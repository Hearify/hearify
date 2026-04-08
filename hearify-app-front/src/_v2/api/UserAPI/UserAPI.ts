import client from '../client';

import type { UserQuizRole } from '@v2/types/user';
import type { BrandKit } from '@v2/types/brand-kit';

class UserAPI {
  public static getQuizRole = async (classCode: string): Promise<UserQuizRole> => {
    const response = await client.get<UserQuizRole>(`/api/quiz-members/${classCode}/get_my_role`);

    return response.data;
  };

  public static getBrandKit = async (userId: string): Promise<BrandKit | null> => {
    try {
      const response = await client.get<BrandKit>(`/api/brand-kit/${userId}`);

      const { font } = response.data;
      if (typeof window !== undefined && font) {
        const fontFace = new FontFace(font.family, font.url, font.options);
        const loadedFont = await fontFace.load();
        document.fonts.add(loadedFont);
      }

      return response.data;
    } catch {
      // Need to catch error because backend can return 500 for empty brand kit
      return null;
    }
  };
}

export default UserAPI;
