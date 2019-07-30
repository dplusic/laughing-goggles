// Tough typings only for me :$
declare module "asciify-image" {
  type AsciifyOptions = {
    fit: "box";
    color: boolean;
    width: number;
    height: number;
    format?: "array";
  };

  type AsciifyRgbTuple = {
    v: string;
    r: number;
    g: number;
    b: number;
  };

  type AsciifyOutput = string;

  function asciify(
    input: string,
    options: AsciifyOptions
  ): Promise<AsciifyOutput>;

  export = asciify;
}
