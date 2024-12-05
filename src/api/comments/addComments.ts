import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';

interface AddCommentVariables {
  parentCommentId: number;
  content: string;
}

const addCommentAPI = async ({
  quizId,
  parentCommentId,
  content,
}: {
  quizId: number;
  parentCommentId: number;
  content: string;
}): Promise<void> => {
  const response = await axiosInstance.post('/quiz/comments', {
    quizId,
    parentCommentId,
    content,
  });
  console.log('댓글 등록 응답:', response.data);
};

function useAddComment(quizId: number) {
  //   const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['addComment', quizId],
    mutationFn: (newComment: AddCommentVariables) => addCommentAPI({ quizId, ...newComment }),
    onSuccess: () => {
      console.log('댓글 등록 성공');
      //   queryClient.invalidateQueries(['comments', quizId]);
    },
    onError: (error: Error) => {
      console.error('댓글 등록 실패:', error.message);
    },
  });
}

export default useAddComment;
