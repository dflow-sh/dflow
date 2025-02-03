import { NodeSSH } from 'node-ssh';

export const destroy = async (ssh: NodeSSH, appName: string) => {
  const resultAppsDestroy = await ssh.execCommand(
    `dokku apps:destroy ${appName} --force`,
  );
  if (resultAppsDestroy.code === 1) {
    console.error(resultAppsDestroy);
    throw new Error(resultAppsDestroy.stderr);
  }

  return true;
};
