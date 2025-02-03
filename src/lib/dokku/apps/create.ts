import { NodeSSH } from 'node-ssh';

export const create = async (ssh: NodeSSH, appName: string) => {
  const resultAppsCreate = await ssh.execCommand(
    `dokku apps:create ${appName}`,
  );
  if (resultAppsCreate.code === 1) {
    console.error(resultAppsCreate);
    throw new Error(resultAppsCreate.stderr);
  }

  return true;
};
