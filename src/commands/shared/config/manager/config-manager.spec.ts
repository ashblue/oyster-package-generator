import * as fs from 'fs';
import { A } from '../../../../utils/builders/a';
import ConfigManager from './config-manager';
import spyOn = jest.spyOn;

jest.mock('fs');

describe('ConfigManager class', () => {
  const setup = () => ({
    configManager: new ConfigManager(),
  });

  describe('generate method', () => {
    it('should generate an .oyster.json file in the current folder', () => {
      const fileName = '.oyster.json';
      const writeFilePath = `./${fileName}`;
      const configData = A.configRaw().build();
      const configDataJson = JSON.stringify(configData, null, 2);

      const { configManager } = setup();
      configManager.generate(configData);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        writeFilePath,
        configDataJson,
      );
    });
  });

  describe('read method', () => {
    it('should return the contents of the .oyster.json file', () => {
      const configData = A.configRaw().build();
      const configDataJson = JSON.stringify(configData, null, 2);
      spyOn(fs, 'readFileSync').mockImplementation(() => configDataJson);

      const { configManager } = setup();
      const result = configManager.read();

      expect(result).toEqual(configData);
    });

    it('should return null if there is no config file', () => {
      spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('File not found');
      });

      const { configManager } = setup();
      const result = configManager.read();

      expect(result).toEqual(null);
    });
  });
});
