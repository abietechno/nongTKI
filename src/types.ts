export type Category = 'Semua' | 'Photographer' | 'Mural Art' | 'Sound Engineer' | 'Video Director' | 'Graphic Designer' | 'Animator';

export interface Creative {
  id: string;
  name: string;
  category: string;
  bio: string;
  ig?: string;
  customLink?: string;
  web?: string;
  photo?: string;
  phone?: string;
  email?: string;
}
