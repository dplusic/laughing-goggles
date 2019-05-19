interface UserParams {
  url?: string;
  width?: number;
  height?: number;
  delay?: number;
}

export const getParams = (): UserParams => {
  const searchParams = new URLSearchParams(window.location.search);
  const url = searchParams.get("url");
  const width = searchParams.get("width");
  const height = searchParams.get("height");
  const delay = searchParams.get("delay");
  return {
    url: url ? url : undefined,
    width: width ? +width : undefined,
    height: height ? +height : undefined,
    delay: delay ? +delay : undefined
  };
};
