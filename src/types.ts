export type Category = 'Semua' | 'Photographer' | 'Mural Art' | 'Sound Engineer' | 'Video Director' | 'Graphic Designer' | 'Animator';

export interface Creative {
  id: string;
  name: string;
  category: string;
  bio: string;
  ig: string;
  threads: string;
  web: string;
  photo: string;
}
