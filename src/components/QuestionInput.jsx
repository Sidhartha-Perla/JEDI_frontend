import { PlusIcon, XIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useInterviewStore } from '../store/interviewStore';

export default function QuestionInput() {
  const { draft, addQuestion, removeQuestion, updateQuestion } = useInterviewStore();

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-800 mb-4">Interview Questions</h2>

      {draft.questions.map((question, index) => (
        <div key={index} className="mb-4">
          <div className="flex items-start gap-3">
            <div className="text-gray-500 font-medium mt-2.5">{index + 1}.</div>
            <div className="flex-1">
              <Input
                value={question}
                onChange={(e) => updateQuestion(index, e.target.value)}
                placeholder="Enter your question"
                className="w-full rounded-xl"
              />
            </div>
            {draft.questions.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(index)}
                className="text-gray-400 hover:text-red-500 mt-1"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        onClick={() => addQuestion()}
        className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6"
      >
        <PlusIcon className="h-5 w-5 mr-1" />
        Add Question
      </Button>
    </div>
  );
}
