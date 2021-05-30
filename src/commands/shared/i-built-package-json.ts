/**
 * The package.json file created after oyster init runs. Has several unique key values in it not native to a normal
 * package.json file
 */
export interface IBuiltPackageJson {
  // Example com.a.b
  name: string;
  displayName: string;
  description: string;

  // Specific version of Unity
  unity: string;
  keywords: string[];
  author: {
    name: string;
    email: string;
    url: string;
  };
}
