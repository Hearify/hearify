import client from '../client';
import { formatTime } from '@src/util/formatTime';

import type * as I from './GenerationAPI.types';
import type { UploadStepForm } from '@src/pages/NewQuiz/UploadStep/UploadStep';
import type { CustomizeStepForm } from '@src/pages/NewQuiz/CustomizeStep/CustomizeStep';

class GenerationAPI {
  public static generateFileQuestions = async (
    data: I.GenerateFileQuestionsRequest,
    file: File
  ): Promise<I.GenerateQuestionsResponse> => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('request', JSON.stringify(data));

    const response = await client.post('/api/generate/generate-file-questions', formData);
    return response.data;
  };

  public static generateTextQuestions = async (
    data: I.GenerateTextQuestionsRequest
  ): Promise<I.GenerateQuestionsResponse> => {
    const response = await client.post('/api/generate/generate-text-questions', data);
    return response.data;
  };

  public static generateYoutubeQuestions = async (
    data: I.GenerateYoutubeQuestionsRequest
  ): Promise<I.GenerateQuestionsResponse> => {
    const response = await client.post('/api/generate/generate-youtube-questions', data);
    return response.data;
  };

  public static generateQuiz = async (
    type: I.GenerationType,
    uploadData: UploadStepForm,
    customizeData: CustomizeStepForm
  ): Promise<I.GenerateQuestionsResponse> => {
    const questionTypes: I.Question[] = [
      {
        name: 'SingleChoice',
        number_of_questions: customizeData.singleChoice,
      },
      {
        name: 'MultipleChoice',
        number_of_questions: customizeData.multiChoice,
      },
      {
        name: 'FillInChoice',
        number_of_questions: customizeData.fillIn,
      },
      {
        name: 'Matching',
        number_of_questions: customizeData.matching,
      },
      {
        name: 'Open',
        number_of_questions: customizeData.open,
      },
    ];

    let response: I.GenerateQuestionsResponse;

    switch (type) {
      case 'file':
        response = await GenerationAPI.generateFileQuestions(
          {
            difficulty: customizeData.difficulty,
            language: uploadData.language,
            question_types: questionTypes,
            additional_prompt: customizeData.prompt,
            end_page: customizeData.to,
            start_page: customizeData.from,
          },
          uploadData.file!
        );
        break;
      case 'youtube':
        response = await GenerationAPI.generateYoutubeQuestions({
          difficulty: customizeData.difficulty,
          language: uploadData.language,
          question_types: questionTypes,
          url: uploadData.youtube!,
          start_time: formatTime(customizeData.from),
          end_time: formatTime(customizeData.to),
          additional_prompt: customizeData.prompt,
        });
        break;
      case 'text':
        response = await GenerationAPI.generateTextQuestions({
          difficulty: customizeData.difficulty,
          language: uploadData.language,
          question_types: questionTypes,
          text: uploadData.prompt!,
        });
        break;
      default:
        throw new Error('Invalid generation type');
    }

    return response;
  };

  public static getGenerationStatus = async (id: string): Promise<string> => {
    const response = await client.get(`/api/generate/statuses/${id}`);
    return response.data.state;
  };

  public static getYoutubeTimecodes = async (url: string): Promise<I.GetYoutubeTimecodesResponse> => {
    const response = await client.post('/api/generate/get-youtube-timecodes', undefined, { params: { url } });
    return response.data;
  };
}

export default GenerationAPI;
