export type Intro = Video;
export type Guitarra = Video;
export type Violao = Video;
export type Finalizar = Video;

export interface Manifest {
  hostTag: string;
  fileResolutionTag: string;
  localHost: string;
  productionHost: string;
  codec: string;
  intro: Intro;
  guitarra: Guitarra;
  violao: Violao;
  finalizar: Finalizar;
}

export interface Video {
  url?: string;
  at?: number;
  options?: string[];
  defaultOption?: string;
}

export interface NetworkManifest {
  url: string;
  fileResolution: string;
  fileResolutionTag: string;
  hostTag: string;
}
