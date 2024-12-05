import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button as ShadcnButton } from '@/shadcn/ui/button';
import FlexBox from '@/components/layout/FlexBox';
import TextArea from '@eolluga/eolluga-ui/Input/TextArea';
import TextField from '@eolluga/eolluga-ui/Input/TextField';
import Radio from '@eolluga/eolluga-ui/Input/Radio';
import Icon from '@eolluga/eolluga-ui/icon/Icon';
import TopBar from '@/components/common/TopBar';
import Card from '@/components/common/Card';
import Container from '@/components/layout/Container';
import Label from '@/components/common/Label';
import ToastMessage from '@/components/common/ToastMessage';
import DropDown from '@/components/common/DropDown';
import TagInput from '@/components/common/TagInput';
import useUpdateQuiz from '@/api/quiz/useUpdateQuiz';
import axiosInstance from '@/api/axiosInstance';
import { toEnglishCategory, toKoreanCategory } from '@/utils/categoryConverter';

const categories = [
  '알고리즘',
  '프로그래밍 언어',
  '네트워크',
  '운영체제',
  '웹 개발',
  '모바일 개발',
  '데브옵스/인프라',
  '데이터베이스',
  '소프트웨어 공학',
];

export default function EditMultipleChoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate: updateQuizMutate } = useUpdateQuiz();

  const [quizData, setQuizData] = useState({
    category: '',
    content: '',
    options: [] as { optionNumber: number; content: string; imageId: null }[],
    tags: [] as string[], // 태그
    answerNumber: null as number | null,
    explanation: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    category: false,
    content: false,
    options: [false, false, false, false],
    answerNumber: false,
    explanation: false,
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ message: '', icon: 'check' });

  // 퀴즈 데이터 가져오기
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axiosInstance.get(`/quiz/${id}`);
        const { result } = response.data;
        console.log('퀴즈 데이터 불러오기:', result);

        setQuizData({
          category: toKoreanCategory(result.category),
          content: result.content,
          options: result.options.map((option: any) => ({
            optionNumber: option.optionNumber,
            content: option.content,
          })),
          tags: result.tags || [],
          answerNumber: result.answerNumber,
          explanation: result.explanation,
        });
      } catch (error) {
        console.error('퀴즈 데이터를 가져오는 중 오류 발생:', error);
        setToastMessage({
          message: '퀴즈 데이터를 불러오는 데 실패했습니다.',
          icon: 'warning',
        });
        setToastOpen(true);
      }
    };

    if (id) fetchQuizData();
  }, [id]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: string, value: string, maxLength?: number) => {
    setQuizData((prev) => ({ ...prev, [field]: value.slice(0, maxLength) }));
    if (field !== 'options') {
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  // 선택지 변경 핸들러
  const handleOptionChange = (optionNumber: number, value: string) => {
    const updatedOptions = quizData.options.map((option) =>
      option.optionNumber === optionNumber ? { ...option, title: value.slice(0, 20) } : option,
    );
    setQuizData((prev) => ({ ...prev, options: updatedOptions }));

    const updatedErrors = [...fieldErrors.options];
    updatedErrors[optionNumber - 1] = value.trim() === '';
    setFieldErrors((prev) => ({ ...prev, options: updatedErrors }));
  };

  // 정답 선택 핸들러
  const handleAnswerChange = (answer: number) => {
    setQuizData((prev) => ({
      ...prev,
      answerNumber: prev.answerNumber === answer ? null : answer, // 기존 값을 취소하면 null로 설정
    }));
    setFieldErrors((prev) => ({ ...prev, answerNumber: false }));
  };

  // 카테고리 선택 핸들러
  const handleCategoryChange = (category: string) => {
    setQuizData((prev) => ({ ...prev, category }));
    setFieldErrors((prev) => ({ ...prev, category: false }));
  };

  // 유효성 검사
  const validateFields = () => {
    const errors = {
      category: quizData.category.trim() === '',
      content: quizData.content.trim() === '',
      options: quizData.options.map((option) => option.content.trim() === ''),
      answerNumber: quizData.answerNumber === 0, // 정답 번호가 없으면 error
      explanation: quizData.explanation.trim() === '',
    };

    setFieldErrors(errors);
    return (
      !errors.category &&
      !errors.content &&
      !errors.explanation &&
      !errors.answerNumber &&
      !errors.options.some((error) => error)
    );
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!validateFields()) {
      setToastMessage({
        message: '모든 항목을 작성해주세요.',
        icon: 'warning',
      });
      setToastOpen(true);
      return;
    }

    const payload = {
      id: Number(id),
      category: toEnglishCategory(quizData.category),
      type: 'MULTIPLE_CHOICE',
      content: quizData.content,
      options: quizData.options,
      answerNumber: quizData.answerNumber,
      explanation: quizData.explanation,
      tags: quizData.tags,
      deleteImageIds: [],
    };

    updateQuizMutate(payload, {
      onSuccess: () => {
        setToastMessage({ message: '퀴즈가 성공적으로 수정되었습니다!', icon: 'check' });
        setToastOpen(true);
        navigate('/profile/quizManagement'); // 수정 완료 후 이동
      },
      onError: () => {
        setToastMessage({ message: '퀴즈 수정에 실패했습니다.', icon: 'warning' });
        setToastOpen(true);
      },
    });
  };

  return (
    <FlexBox direction="col">
      <Container>
        <TopBar
          leftIcon="left"
          leftText="객관식 퀴즈 수정"
          onClickLeft={() => navigate('/profile/quizManagement')}
        />
        <Card>
          <div className="mb-4">
            <Label content="퀴즈 유형" htmlFor="quiz-type" className="mb-1" />
            <div className="flex flex-row items-center gap-4">
              <Radio
                alert="퀴즈 유형을 선택해주세요."
                size="M"
                state="readOnly"
                title="OX 퀴즈"
                checked={false}
              />
              <Radio
                alert="퀴즈 유형을 선택해주세요."
                size="M"
                state="readOnly"
                title="AB 테스트"
                checked={false}
              />
              <Radio
                alert="퀴즈 유형을 선택해주세요."
                size="M"
                state="readOnly"
                title="객관식"
                checked={true}
              />
            </div>
          </div>

          {/* 태그 입력 */}
          <div className="mb-4">
            <Label content="태그" htmlFor="tags" className="mb-1" />
            <TagInput
              tags={quizData.tags}
              setTags={(tags) => setQuizData((prev) => ({ ...prev, tags }))}
            />
          </div>

          {/* 카테고리 선택 */}
          <div className="mb-4">
            <Label content="카테고리" />
            <DropDown
              items={categories}
              selectedItem={quizData.category}
              setItem={handleCategoryChange}
              placeholder="카테고리를 선택하세요."
              alert="카테고리를 선택해주세요."
              required={fieldErrors.category}
            />
          </div>

          {/* 문제 입력 */}
          <div className="mb-4">
            <Label content="문제" />
            <TextArea
              value={quizData.content}
              onChange={(e) => handleInputChange('content', e.target.value, 42)}
              placeholder="문제를 입력하세요."
              size="M"
              state={fieldErrors.content ? 'error' : 'enable'}
            />
          </div>

          {/* 선택지 입력 */}
          <div className="mb-4">
            {quizData.options.map((option) => (
              <div key={option.optionNumber} className="mb-2">
                <Label content={`${option.optionNumber}번 선택지`} />
                <TextField
                  mode="outlined"
                  value={option.content}
                  onChange={(e) => handleOptionChange(option.optionNumber, e.target.value)}
                  placeholder={`${option.optionNumber}번 선택지를 입력하세요.`}
                  size="M"
                  state={fieldErrors.options[option.optionNumber - 1] ? 'error' : 'enable'}
                />
              </div>
            ))}
          </div>

          {/* 정답 선택 */}
          <div className="mb-4">
            <Label content="정답" />
            <div className="flex flex-row items-center gap-4">
              {quizData.options.map((option) => (
                <Radio
                  key={option.optionNumber}
                  size="M"
                  state={fieldErrors.answerNumber ? 'error' : 'enable'}
                  title={`${option.optionNumber}`}
                  checked={quizData.answerNumber === option.optionNumber}
                  onChange={() => handleAnswerChange(option.optionNumber)}
                />
              ))}
            </div>
            {fieldErrors.answerNumber && (
              <div className="mt-2 flex items-center text-red-500 text-sm">
                <Icon icon="warning_triangle_filled" className="mr-2" size={16} />
                정답을 선택해주세요.
              </div>
            )}
          </div>

          {/* 해설 입력 */}
          <Label content="해설" />
          <TextArea
            value={quizData.explanation}
            onChange={(e) => handleInputChange('explanation', e.target.value, 70)}
            placeholder="해설을 입력하세요."
            size="M"
            state={fieldErrors.explanation ? 'error' : 'enable'}
          />
        </Card>

        {/* 제출 버튼 */}
        <ShadcnButton
          className="w-full h-12 text-lg relative"
          size="default"
          onClick={handleSubmit}
        >
          퀴즈 수정하기
          <ToastMessage
            message={toastMessage.message}
            icon={toastMessage.icon as 'check' | 'warning'}
            open={toastOpen}
            setOpen={setToastOpen}
          />
        </ShadcnButton>
      </Container>
    </FlexBox>
  );
}
