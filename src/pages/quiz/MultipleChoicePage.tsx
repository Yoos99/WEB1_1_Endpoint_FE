import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button as ShadcnButton } from '@/shadcn/ui/button';
import FlexBox from '@/components/layout/FlexBox';
import Radio from '@eolluga/eolluga-ui/Input/Radio';
import TextArea from '@eolluga/eolluga-ui/Input/TextArea';
import TextField from '@eolluga/eolluga-ui/Input/TextField';
import Icon from '@eolluga/eolluga-ui/icon/Icon';
import TopBar from '@/components/common/TopBar';
import Card from '@/components/common/Card';
import Container from '@/components/layout/Container';
import DropDown from '@/components/common/DropDown';
import Label from '@/components/common/Label';
import ToastMessage from '@/components/common/ToastMessage';
import TagInput from '@/components/common/TagInput';
import useCreateQuiz from '@/api/quiz/useCreateQuiz';
import { toEnglishCategory } from '@/utils/categoryConverter';
import AboutPage from '@/components/common/AboutPage';

// 카테고리 목록
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

export default function MultipleChoicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: createQuizMutate } = useCreateQuiz();

  // 퀴즈 데이터 상태
  const [formData, setFormData] = useState({
    category: '', // 카테고리
    question: '', // 문제
    options: ['', '', '', ''], // 선택지
    selectedAnswer: null as number | null, // 정답
    explanation: '', // 해설
    tags: [] as string[], // 태그
  });

  // 필드 에러 상태 관리
  const [fieldErrors, setFieldErrors] = useState({
    category: false,
    question: false,
    options: [false, false, false, false],
    explanation: false,
    selectedAnswer: false,
  });

  // 토스트 메시지 상태
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ message: '', icon: 'check' });

  // 현재 선택된 퀴즈 유형
  const [selectedQuizType, setSelectedQuizType] = useState('');

  // URL에 따라 퀴즈 유형 초기화
  useEffect(() => {
    if (location.pathname === '/quiz/multiple') {
      setSelectedQuizType('multiple');
    }
  }, [location.pathname]);

  // 퀴즈 유형 변경
  const handleQuizTypeChange = (selected: string) => {
    setSelectedQuizType(selected);
    switch (selected) {
      case 'ox':
        navigate('/quiz/ox');
        break;
      case 'ab':
        navigate('/quiz/ab');
        break;
      case 'multiple':
        navigate('/quiz/multiple');
        break;
      default:
        break;
    }
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof typeof formData, value: string, maxLength?: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.slice(0, maxLength), // 최대 글자 수 제한
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  // 선택지 변경 핸들러
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = value.slice(0, 30); // 선택지 최대 글자 수 제한
    setFormData((prev) => ({
      ...prev,
      options: updatedOptions,
    }));

    const updatedErrors = [...fieldErrors.options];
    updatedErrors[index] = value.trim() === '';
    setFieldErrors((prev) => ({
      ...prev,
      options: updatedErrors,
    }));
  };

  // 정답 선택 핸들러
  const handleAnswerChange = (answer: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedAnswer: prev.selectedAnswer === answer ? null : answer,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      selectedAnswer: false,
    }));
  };

  // 유효성 검사
  const validateFields = () => {
    const updatedErrors = {
      category: formData.category.trim() === '',
      question: formData.question.trim() === '',
      options: formData.options.map((option) => option.trim() === ''),
      explanation: formData.explanation.trim() === '',
      selectedAnswer: formData.selectedAnswer === null,
    };

    setFieldErrors(updatedErrors);

    // 에러가 하나라도 있으면 false 반환
    return (
      !updatedErrors.category &&
      !updatedErrors.question &&
      !updatedErrors.options.some((err) => err) &&
      !updatedErrors.explanation &&
      !updatedErrors.selectedAnswer
    );
  };

  // 제출 버튼 클릭 시 처리
  const handleSubmit = () => {
    const isValid = validateFields();

    if (!isValid) {
      setToastMessage({ message: '모든 항목을 작성해주세요.', icon: 'warning' });
      setToastOpen(true);
      return;
    }

    setToastMessage({ message: '퀴즈가 생성되었습니다!', icon: 'check' });
    setToastOpen(true);

    const englishCategory = toEnglishCategory(formData.category);
    const payload = {
      category: englishCategory,
      type: 'MULTIPLE_CHOICE',
      content: formData.question,
      tags: formData.tags,
      options: formData.options.map((option, index) => ({
        optionNumber: index + 1,
        content: option,
        imageId: null,
      })),
      answerNumber: formData.selectedAnswer,
      explanation: formData.explanation,
    };

    createQuizMutate(payload, {
      onSuccess: () => {
        setToastMessage({ message: '퀴즈가 생성되었습니다!', icon: 'check' });
        setToastOpen(true);
        // 상태 초기화
        setFormData({
          category: '',
          question: '',
          options: ['', '', '', ''],
          selectedAnswer: null,
          explanation: '',
          tags: [],
        });

        setFieldErrors({
          category: false,
          question: false,
          options: [false, false, false, false],
          explanation: false,
          selectedAnswer: false,
        });
      },
      onError: () => {
        setToastMessage({ message: '퀴즈 생성에 실패했습니다.', icon: 'warning' });
        setToastOpen(true);
      },
    });
  };

  return (
    <FlexBox direction="col">
      <AboutPage
        title="객관식 퀴즈"
        description="내가 원하는 주제로 객관식 퀴즈를 만들어보세요."
        keywords="quiz, Multiple, 퀴즈, 객관식 퀴즈"
      />
      <Container>
        <TopBar
          leftIcon="left"
          leftText="객관식 퀴즈 만들기"
          onClickLeft={() => navigate('/profile')}
        />
        <Card>
          {/* 퀴즈 유형 선택 */}
          <div className="mb-4">
            <Label content="퀴즈 유형" htmlFor="quiz-type" className="mb-1" />
            <div className="flex flex-row items-center gap-4">
              <Radio
                alert="퀴즈 유형을 선택해주세요."
                size="M"
                state="enable"
                title="OX 퀴즈"
                checked={selectedQuizType === 'ox'}
                onChange={() => handleQuizTypeChange('ox')}
              />
              <Radio
                alert="퀴즈 유형을 선택해주세요."
                size="M"
                state="enable"
                title="AB 테스트"
                checked={selectedQuizType === 'ab'}
                onChange={() => handleQuizTypeChange('ab')}
              />
              <Radio
                alert="퀴즈 유형을 선택해주세요."
                size="M"
                state="enable"
                title="객관식"
                checked={selectedQuizType === 'multiple'}
                onChange={() => handleQuizTypeChange('multiple')}
              />
            </div>
          </div>

          {/* 태그 입력 */}
          <div className="mb-4">
            <Label content="태그" htmlFor="tags" className="mb-1" />
            <TagInput
              tags={formData.tags}
              setTags={(tags) => setFormData((prev) => ({ ...prev, tags }))}
            />
          </div>

          {/* 카테고리 선택 */}
          <div className="mb-4">
            <Label content="주제" htmlFor="category" className="mb-1" />
            <DropDown
              items={categories}
              selectedItem={formData.category}
              setItem={(value: string) => handleInputChange('category', value)}
              placeholder="주제를 선택하세요"
              alert="주제를 선택해주세요."
              required={fieldErrors.category && formData.category === ''}
            />
          </div>

          {/* 문제 입력 */}
          <div className="mb-4">
            <Label content="문제" htmlFor="quiz-question" className="mb-1" />
            <TextArea
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value, 70)} // 42글자 제한
              placeholder="문제를 입력하세요."
              size="M"
              state={fieldErrors.question ? 'error' : 'enable'}
            />
          </div>

          {/* 선택지 입력 */}
          <div className="mb-4">
            {formData.options.map((option, index) => (
              <div key={index} className="mb-2">
                <Label
                  content={`${index + 1}번 선택지`}
                  htmlFor={`option-${index + 1}`}
                  className="mb-1"
                />
                <TextField
                  mode="outlined"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`${index + 1}번 선택지를 입력하세요.`}
                  size="M"
                  state={fieldErrors.options[index] ? 'error' : 'enable'}
                />
              </div>
            ))}
          </div>

          {/* 정답 선택 */}
          <div className="mb-4">
            <Label content="정답" htmlFor="answer" className="mb-1" />
            <div className="flex flex-row items-center gap-4">
              {formData.options.map((_, index) => (
                <Radio
                  key={index}
                  size="M"
                  state={fieldErrors.selectedAnswer ? 'error' : 'enable'}
                  title={`${index + 1}`}
                  checked={formData.selectedAnswer === index + 1}
                  onChange={() => handleAnswerChange(index + 1)}
                />
              ))}
            </div>
            {fieldErrors.selectedAnswer && (
              <div className="mt-2 flex items-center text-red-500 text-sm">
                <Icon icon="warning_triangle_filled" className="mr-2" size={16} />
                정답을 선택해주세요.
              </div>
            )}
          </div>

          {/* 해설 입력 */}
          <Label content="해설" htmlFor="explanation" className="mb-1" />
          <TextArea
            value={formData.explanation}
            onChange={(e) => handleInputChange('explanation', e.target.value, 100)} // 70글자 제한
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
          퀴즈 생성하기
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
