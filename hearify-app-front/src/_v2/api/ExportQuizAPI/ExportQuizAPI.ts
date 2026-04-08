import client from '../client';

class ExportQuizAPI {
  public static getGoogleFormsUrl = async (): Promise<string> => {
    const response = await client.get<Array<string>>('/api/google-forms/authorize');

    return response.data[0];
  };

  public static exportPDF = async (classCode: string): Promise<Blob> => {
    const response = await client.get(`/api/csv-loader/${classCode}/pdf`, {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'application/json',
      },
    });

    return new Blob([response.data], { type: 'application/pdf' });
  };
}

export default ExportQuizAPI;
