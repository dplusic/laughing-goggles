// Tough typings only for me :$
declare module "asciify-image" {
  type AsciifyOptions = {
    fit: "box";
    color: boolean;
    width: number;
    height: number;
    format: "rgb";
  };

  type AsciifyRgbTuple = {
    v: string;
    r: number;
    g: number;
    b: number;
  };

  type AsciifyOutput = AsciifyRgbTuple[][];

  function asciify(
    input: string,
    options: AsciifyOptions
  ): Promise<AsciifyOutput>;

  export = asciify;
}
