import { NodeSSH, SSHExecOptions } from 'node-ssh';

export const create = async (
  ssh: NodeSSH,
  name: string,
  databaseType: string,
  options?: SSHExecOptions,
) => {
  const resultDatabaseCreate = await ssh.execCommand(
    `dokku ${databaseType}:create ${name}`,
    options,
  );

  return resultDatabaseCreate;
};
