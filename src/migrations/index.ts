import * as migration_20260419_232634 from './20260419_232634';
import * as migration_20260927_051524_media_object_key from './20260927_051524_media_object_key';

export const migrations = [
  {
    up: migration_20260419_232634.up,
    down: migration_20260419_232634.down,
    name: '20260419_232634',
  },
  {
    up: migration_20260927_051524_media_object_key.up,
    down: migration_20260927_051524_media_object_key.down,
    name: '20260927_051524_media_object_key'
  },
];
