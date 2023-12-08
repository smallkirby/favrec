import FavListing from '@/components/record/FavListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Favs | FavRec',
};

export default function FavsPage() {
  return <FavListing />;
}
