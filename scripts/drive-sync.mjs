import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { google } from 'googleapis';

const DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';
const DRIVE_NATIVE_MIME_PREFIX = 'application/vnd.google-apps.';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const ROOT_FOLDER_NAME = 'wiki';
const docsRoot = path.join(process.cwd(), 'src/app/_shared/content');

const syncTargets = [
  {
    sourcePath: ['blog'],
    destinationRoot: path.join(docsRoot, 'blog'),
    preservePrefixes: [],
  },
  {
    sourcePath: ['zt', 'literature'],
    destinationRoot: path.join(docsRoot, 'note'),
    preservePrefixes: [path.join(docsRoot, 'note', '.pending')],
  },
];

const main = async () => {
  const drive = await createDriveClient();
  const rootFolderId = await resolveRootFolderId(drive);

  for (const target of syncTargets) {
    const sourceFolderId = await resolveFolderPath(drive, rootFolderId, target.sourcePath);
    const sourceFiles = await collectDriveFiles(drive, sourceFolderId);

    await syncTarget(drive, sourceFiles, target);
  }
};

const createDriveClient = async () => {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is required.');
  }

  const credentials = JSON.parse(serviceAccountKey);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [DRIVE_SCOPE],
  });
  const authClient = await auth.getClient();

  return google.drive({
    version: 'v3',
    auth: authClient,
  });
};

const resolveRootFolderId = async (drive) => {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (rootFolderId) {
    return rootFolderId;
  }

  const matches = await listFiles(drive, [
    `name = '${escapeQueryValue(ROOT_FOLDER_NAME)}'`,
    `mimeType = '${DRIVE_FOLDER_MIME}'`,
    'trashed = false',
  ]);

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one shared '${ROOT_FOLDER_NAME}' folder, found ${matches.length}.`,
    );
  }

  return matches[0].id;
};

const resolveFolderPath = async (drive, rootFolderId, segments) => {
  let currentFolderId = rootFolderId;

  for (const segment of segments) {
    const matches = await listFiles(drive, [
      `'${currentFolderId}' in parents`,
      `name = '${escapeQueryValue(segment)}'`,
      `mimeType = '${DRIVE_FOLDER_MIME}'`,
      'trashed = false',
    ]);

    if (matches.length !== 1) {
      throw new Error(`Expected exactly one '${segment}' folder under '${currentFolderId}', found ${matches.length}.`);
    }

    currentFolderId = matches[0].id;
  }

  return currentFolderId;
};

const listFiles = async (drive, clauses) => {
  const files = [];
  let pageToken;

  do {
    const response = await drive.files.list({
      q: clauses.join(' and '),
      pageSize: 1000,
      pageToken,
      fields: 'nextPageToken, files(id, name, mimeType)',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    files.push(...(response.data.files ?? []));
    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return files;
};

const collectDriveFiles = async (drive, folderId, prefix = '') => {
  const children = await listFiles(drive, [`'${folderId}' in parents`, 'trashed = false']);
  const files = [];

  for (const child of children) {
    const childPath = prefix ? path.posix.join(prefix, child.name) : child.name;

    if (child.mimeType === DRIVE_FOLDER_MIME) {
      files.push(...(await collectDriveFiles(drive, child.id, childPath)));
      continue;
    }

    if (child.mimeType.startsWith(DRIVE_NATIVE_MIME_PREFIX)) {
      throw new Error(`Unsupported Google native file in sync target: ${childPath}`);
    }

    files.push({
      id: child.id,
      mimeType: child.mimeType,
      relativePath: childPath,
    });
  }

  return files;
};

const syncTarget = async (drive, sourceFiles, target) => {
  const expectedFiles = new Map();

  for (const sourceFile of sourceFiles) {
    const relativeDestinationPath = toDestinationPath(sourceFile.relativePath);
    const destinationPath = path.join(target.destinationRoot, relativeDestinationPath);

    expectedFiles.set(destinationPath, sourceFile);
  }

  await deleteStaleFiles(target.destinationRoot, expectedFiles, target.preservePrefixes);

  for (const [destinationPath, sourceFile] of expectedFiles) {
    const content = await downloadFile(drive, sourceFile.id);

    await writeIfChanged(destinationPath, content);
  }

  await removeEmptyDirectories(target.destinationRoot, target.preservePrefixes);

  console.log(
    `synced ${sourceFiles.length} file(s) from ${target.sourcePath.join('/')} to ${path.relative(process.cwd(), target.destinationRoot)}`,
  );
};

const toDestinationPath = (relativePath) => {
  if (relativePath.endsWith('.md')) {
    return `${relativePath.slice(0, -3)}.mdx`;
  }

  return relativePath;
};

const deleteStaleFiles = async (destinationRoot, expectedFiles, preservePrefixes) => {
  const existingFiles = await collectLocalFiles(destinationRoot, preservePrefixes);

  for (const existingFile of existingFiles) {
    if (expectedFiles.has(existingFile)) {
      continue;
    }

    await rm(existingFile, { force: true });
  }
};

const collectLocalFiles = async (directoryPath, preservePrefixes) => {
  try {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const entryPath = path.join(directoryPath, entry.name);

      if (preservePrefixes.some((prefix) => isSamePathOrDescendant(entryPath, prefix))) {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...(await collectLocalFiles(entryPath, preservePrefixes)));
        continue;
      }

      files.push(entryPath);
    }

    return files;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const downloadFile = async (drive, fileId) => {
  const response = await drive.files.get(
    {
      fileId,
      alt: 'media',
      supportsAllDrives: true,
    },
    {
      responseType: 'arraybuffer',
    },
  );

  return Buffer.from(response.data);
};

const writeIfChanged = async (filePath, content) => {
  const existingContent = await readBufferIfExists(filePath);

  if (existingContent && existingContent.equals(content)) {
    return;
  }

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
};

const readBufferIfExists = async (filePath) => {
  try {
    return await readFile(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
};

const removeEmptyDirectories = async (directoryPath, preservePrefixes) => {
  let entries;

  try {
    entries = await readdir(directoryPath, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }

  let hasEntries = false;

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (preservePrefixes.some((prefix) => isSamePathOrDescendant(entryPath, prefix))) {
      hasEntries = true;
      continue;
    }

    if (!entry.isDirectory()) {
      hasEntries = true;
      continue;
    }

    const childHasEntries = await removeEmptyDirectories(entryPath, preservePrefixes);

    if (!childHasEntries) {
      await rm(entryPath, { recursive: true, force: true });
      continue;
    }

    hasEntries = true;
  }

  return hasEntries;
};

const isSamePathOrDescendant = (targetPath, ancestorPath) => {
  if (targetPath === ancestorPath) {
    return true;
  }

  const relativePath = path.relative(ancestorPath, targetPath);

  return relativePath !== '' && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
};

const escapeQueryValue = (value) => {
  return value.replace(/'/g, "\\'");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
