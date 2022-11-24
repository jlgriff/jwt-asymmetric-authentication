/* eslint-disable object-curly-newline */
import { config } from 'dotenv';

config({ path: '.env' });

interface EnvConfig {
  name: string;
  value: string | undefined;
  required: boolean;
}

/**
 * Kills app startup if any necessary configurations are missing
 *
 * @param configurations - configurations from the .env file
 */
const checkConfigurations = (configurations: EnvConfig[]): void => {
  configurations
    .filter((c) => c.value === undefined)
    .forEach((c) => {
      if (c.required) {
        console.error('error', `Missing ${c.name} config. Terminating application startup.`);
        process.exit();
      } else {
        console.warn('warn', `Missing ${c.name} config. Using a default value.`);
      }
    });
};

const {
  KEY_PATH_PRIVATE,
  KEY_PATH_PUBLIC,
} = process.env;

const configurations: EnvConfig[] = [
  { name: 'KEY_PATH_PRIVATE', value: KEY_PATH_PRIVATE, required: true },
  { name: 'KEY_PATH_PUBLIC', value: KEY_PATH_PUBLIC, required: true },
];

checkConfigurations(configurations);

export const privateKeyPath: string = KEY_PATH_PRIVATE!;
export const publicKeyPath: string = KEY_PATH_PUBLIC!;
