import { NodeSSH } from 'node-ssh';

export const destroy = async (
  ssh: NodeSSH,
  databaseName: string,
  databaseType: string,
) => {
  const resultDatabaseDestroy = await ssh.execCommand(
    `dokku ${databaseType}:destroy ${databaseName} --force`,
  );
  if (resultDatabaseDestroy.code === 1) {
    console.error(resultDatabaseDestroy);
    throw new Error(resultDatabaseDestroy.stderr);
  }

  return true;
};
