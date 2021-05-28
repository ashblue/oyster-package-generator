export default interface IConfigRaw {
  packageName: string;
  displayName: string;
  description: string;
  oysterVersion: string;
  unityVersion: string;
  packageScope: string;
  keywords: string[];

  author: {
    name: string;
    email: string;
    url: string;
  };

  repo: {
    gitUrl: string;
    gitUrlNoHttp: string;
  };
}
