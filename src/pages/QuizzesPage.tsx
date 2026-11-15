import { useState, useEffect, useCallback } from 'react';
import {
  quizApi,
  type Quiz,
  type QuizQuestion,
  type QuizStats,
} from '@/services/quizApi';
import { getApiErrorMessage } from '@/services/api';
import {
  FileQuestion,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  X,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null);

  // Form state for Quiz Editor
  const [quizForm, setQuizForm] = useState<{
    title: string;
    instructions: string;
    time_limit_minutes: number | string;
    passing_score: number | string;
    questions: QuizQuestion[];
  }>({
    title: '',
    instructions: '',
    time_limit_minutes: 0,
    passing_score: 0,
    questions: [],
  });

  // Collapsed state for questions in Quiz Editor modal
  const [collapsedQuestionIds, setCollapsedQuestionIds] = useState<number[]>([]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [quizzesData, statsData] = await Promise.all([
        quizApi.getAll(),
        quizApi.getStats(),
      ]);
      setQuizzes(quizzesData);
      setStats(statsData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load quizzes'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleQuestionCollapse = (questionId: number) => {
    setCollapsedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const collapseAllQuestions = () => {
    setCollapsedQuestionIds(quizForm.questions.map((q) => q.id));
  };

  const expandAllQuestions = () => {
    setCollapsedQuestionIds([]);
  };

  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open Editor for Creating or Editing
  const handleOpenEditor = (quiz?: Quiz) => {
    setCollapsedQuestionIds([]);
    if (quiz) {
      setEditingQuizId(quiz.id);
      // Immediately populate form with existing quiz data so it opens without delay
      setQuizForm({
        title: quiz.title || '',
        instructions: quiz.instructions || '',
        time_limit_minutes: quiz.time_limit_minutes ?? 0,
        passing_score: quiz.passing_score ?? 0,
        questions:
          quiz.questions && quiz.questions.length > 0
            ? JSON.parse(JSON.stringify(quiz.questions))
            : [
                {
                  id: 1,
                  question: '',
                  options: [
                    { id: 1, text: '' },
                    { id: 2, text: '' },
                    { id: 3, text: '' },
                    { id: 4, text: '' },
                  ],
                  correct_option_index: 0,
                  explanation: '',
                },
              ],
      });
      setEditorOpen(true);

      // Fetch full quiz details in background if questions were not fully embedded
      quizApi
        .getById(quiz.id)
        .then((fullQuiz) => {
          if (fullQuiz) {
            setQuizForm((prev) => ({
              ...prev,
              title: fullQuiz.title || prev.title,
              instructions: fullQuiz.instructions || prev.instructions,
              time_limit_minutes: fullQuiz.time_limit_minutes ?? prev.time_limit_minutes,
              passing_score: fullQuiz.passing_score ?? prev.passing_score,
              questions:
                fullQuiz.questions && fullQuiz.questions.length > 0
                  ? JSON.parse(JSON.stringify(fullQuiz.questions))
                  : prev.questions,
            }));
          }
        })
        .catch(() => {});
    } else {
      setEditingQuizId(null);
      setQuizForm({
        title: '',
        instructions: '',
        time_limit_minutes: 0,
        passing_score: 0,
        questions: [
          {
            id: Date.now(),
            question: '',
            options: [
              { id: 1, text: '' },
              { id: 2, text: '' },
              { id: 3, text: '' },
              { id: 4, text: '' },
            ],
            correct_option_index: 0,
            explanation: '',
          },
        ],
      });
      setEditorOpen(true);
    }
  };

  // Save Quiz (Create or Update)
  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    if (quizForm.questions.length === 0) {
      toast.error('Please add at least one question to the quiz');
      return;
    }

    // Check for empty question prompts
    const hasEmptyQuestion = quizForm.questions.some((q) => !q.question.trim());
    if (hasEmptyQuestion) {
      toast.error('Please fill in the question text for all questions');
      return;
    }

    // Check for empty option text
    for (let i = 0; i < quizForm.questions.length; i++) {
      const q = quizForm.questions[i];
      const hasEmptyOpt = q.options.some((opt) => !opt.text.trim());
      if (hasEmptyOpt) {
        toast.error(`Please fill in all option choices for Question ${i + 1}`);
        return;
      }
    }

    const timeLimit = quizForm.time_limit_minutes === '' ? 0 : Number(quizForm.time_limit_minutes);
    const passScore = quizForm.passing_score === '' ? 0 : Number(quizForm.passing_score);
    const safeTimeLimit = isNaN(timeLimit) ? 0 : Math.max(0, timeLimit);
    const safePassScore = isNaN(passScore) ? 0 : Math.min(100, Math.max(0, passScore));

    try {
      setIsSaving(true);
      if (editingQuizId) {
        const updated = await quizApi.update(editingQuizId, {
          title: quizForm.title.trim(),
          instructions: quizForm.instructions?.trim() || '',
          time_limit_minutes: safeTimeLimit,
          passing_score: safePassScore,
          questions: quizForm.questions,
        });

        setQuizzes((prev) =>
          prev.map((q) => (q.id === editingQuizId ? updated : q))
        );
        toast.success(`Quiz "${quizForm.title}" updated successfully`);
      } else {
        const created = await quizApi.create({
          title: quizForm.title.trim(),
          instructions: quizForm.instructions?.trim() || '',
          time_limit_minutes: safeTimeLimit,
          passing_score: safePassScore,
          questions: quizForm.questions,
        });

        setQuizzes((prev) => [created, ...prev]);
        toast.success(`Quiz "${quizForm.title}" created successfully`);
      }

      // Refresh stats
      quizApi.getStats().then(setStats).catch(() => {});
      setEditorOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save quiz'));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Quiz
  const handleDeleteQuiz = async (id: number) => {
    try {
      setIsDeleting(true);
      const res = await quizApi.delete(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      setDeleteQuizId(null);
      toast.success(`Quiz "${res.title}" deleted successfully`);

      // Refresh stats
      quizApi.getStats().then(setStats).catch(() => {});
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete quiz'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Question Management within Form
  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      question: '',
      options: [
        { id: 1, text: '' },
        { id: 2, text: '' },
        { id: 3, text: '' },
        { id: 4, text: '' },
      ],
      correct_option_index: 0,
      explanation: '',
    };
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, newQuestion],
    });
  };

  const handleRemoveQuestion = (questionId: number) => {
    if (quizForm.questions.length <= 1) {
      toast.error('A quiz must have at least one question');
      return;
    }
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.filter((q) => q.id !== questionId),
    });
  };

  // Option Management within a Question
  const handleAddOption = (questionId: number) => {
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.map((q) => {
        if (q.id === questionId) {
          if (q.options.length >= 6) {
            toast.error('Maximum 6 options allowed per question');
            return q;
          }
          return {
            ...q,
            options: [...q.options, { id: Date.now(), text: '' }],
          };
        }
        return q;
      }),
    });
  };

  const handleRemoveOption = (questionId: number, optionIndex: number) => {
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.map((q) => {
        if (q.id === questionId) {
          if (q.options.length <= 2) {
            toast.error('A question must have at least 2 options');
            return q;
          }
          const nextOptions = q.options.filter((_, idx) => idx !== optionIndex);
          const nextCorrect =
            q.correct_option_index >= nextOptions.length
              ? 0
              : q.correct_option_index === optionIndex
              ? 0
              : q.correct_option_index > optionIndex
              ? q.correct_option_index - 1
              : q.correct_option_index;
          return {
            ...q,
            options: nextOptions,
            correct_option_index: nextCorrect,
          };
        }
        return q;
      }),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileQuestion className="h-6 w-6 text-primary" />
            Quiz Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Create and manage module quizzes, passing criteria, and multiple-choice questions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => handleOpenEditor()}
            size="sm"
            className="gap-2 font-medium shrink-0 shadow-sm h-9 text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            Create New Quiz
          </Button>
        </div>
      </div>

      {/* Metrics Row (3 cards: Total Quizzes, Total Questions, Pass Threshold) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total Quizzes</span>
            <FileQuestion className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">
            {stats ? stats.total_quizzes : quizzes.length}
          </p>
        </Card>

        <Card className="p-4 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total Questions</span>
            <HelpCircle className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">
            {stats
              ? stats.total_questions
              : quizzes.reduce((acc, q) => acc + (q.questions?.length || q.total_questions), 0)}
          </p>
        </Card>

        <Card className="p-4 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Standard Pass Threshold</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">
            {stats ? stats.standard_pass_threshold : '80%'}
          </p>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by quiz title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs sm:text-sm h-9 placeholder:text-xs placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Clean Quizzes Table: Simple Name, Questions, Time, Pass Score, Actions */}
      <Card className="border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold">Quiz Title</TableHead>
                <TableHead className="text-xs font-semibold">Total Questions</TableHead>
                <TableHead className="text-xs font-semibold">Time</TableHead>
                <TableHead className="text-xs font-semibold">Pass Score</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">Loading quizzes...</p>
                  </TableCell>
                </TableRow>
              ) : filteredQuizzes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                    No quizzes found. Click &quot;Create New Quiz&quot; above to add one.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <TableRow key={quiz.id} className="hover:bg-muted/30">
                    {/* 1. Quiz Title */}
                    <TableCell className="font-medium text-xs text-foreground py-3.5">
                      {quiz.title}
                    </TableCell>

                    {/* 2. Total Questions */}
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {quiz.questions?.length ?? quiz.total_questions}
                      </span>{' '}
                      Questions
                    </TableCell>

                    {/* 3. Time */}
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{quiz.time_limit_minutes}</span> mins
                    </TableCell>

                    {/* 4. Pass Score */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                      >
                        {quiz.passing_score}%
                      </Badge>
                    </TableCell>

                    {/* 5. Action Buttons (View, Edit, Delete) */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              const full = await quizApi.getById(quiz.id);
                              setPreviewQuiz(full);
                            } catch {
                              setPreviewQuiz(quiz);
                            }
                          }}
                          className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          title="View Questions"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditor(quiz)}
                          className="h-8 text-xs gap-1 font-medium"
                          title="Edit Quiz"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteQuizId(quiz.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Delete Quiz"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* -------------------------------------------------------------------------------- */}
      {/* QUIZ EDITOR MODAL: Create & Edit Full Quiz with Multiple Choice Questions */}
      {/* -------------------------------------------------------------------------------- */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl">
          <DialogHeader className="px-6 pt-5 pb-3 border-b">
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" />
              <span>{editingQuizId ? 'Edit Quiz' : 'Create New Quiz'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure quiz metadata, pass thresholds, and multiple-choice questions with correct answers.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Form Body */}
          <div className="overflow-y-auto px-6 py-4 space-y-5 flex-1 text-xs sm:text-sm">
            {/* Section 1: Quiz Information */}
            <div className="space-y-3.5 bg-muted/20 p-4 rounded-xl border">
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                1. Quiz Settings
              </h4>

              <div className="space-y-1.5">
                <Label htmlFor="quiz_title" className="text-xs font-semibold">
                  Quiz Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quiz_title"
                  placeholder="Enter Exam Name"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="text-xs sm:text-sm h-9 placeholder:text-xs placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quiz_inst" className="text-xs font-semibold">
                  Instructions & Exam Rules
                </Label>
                <textarea
                  id="quiz_inst"
                  rows={2}
                  placeholder="Enter Exam Instructions"
                  value={quizForm.instructions}
                  onChange={(e) => setQuizForm({ ...quizForm, instructions: e.target.value })}
                  className="w-full rounded-md border border-input bg-background p-2.5 text-xs sm:text-sm placeholder:text-xs placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="quiz_time" className="text-xs font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    Time Limit (Minutes) *
                  </Label>
                  <Input
                    id="quiz_time"
                    type="number"
                    min={0}
                    value={quizForm.time_limit_minutes}
                    onChange={(e) =>
                      setQuizForm({
                        ...quizForm,
                        time_limit_minutes:
                          e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="text-xs sm:text-sm h-9 placeholder:text-xs"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quiz_pass" className="text-xs font-semibold flex items-center gap-1">
                    <Award className="h-3 w-3 text-muted-foreground" />
                    Passing Score (%) *
                  </Label>
                  <Input
                    id="quiz_pass"
                    type="number"
                    min={0}
                    max={100}
                    value={quizForm.passing_score}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setQuizForm({ ...quizForm, passing_score: '' });
                      } else {
                        const parsed = parseInt(val, 10);
                        setQuizForm({
                          ...quizForm,
                          passing_score: isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed)),
                        });
                      }
                    }}
                    className="text-xs sm:text-sm h-9 placeholder:text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Questions List */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    2. Questions & Answer Sets ({quizForm.questions.length})
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Click each question card header or &quot;Collapse&quot; to collapse and save space.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {quizForm.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={
                        collapsedQuestionIds.length === quizForm.questions.length
                          ? expandAllQuestions
                          : collapseAllQuestions
                      }
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {collapsedQuestionIds.length === quizForm.questions.length
                        ? 'Expand All'
                        : 'Collapse All'}
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleAddQuestion}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5 font-medium shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Question
                  </Button>
                </div>
              </div>

              {quizForm.questions.map((q, qIndex) => {
                const isCollapsed = collapsedQuestionIds.includes(q.id);

                return (
                  <div
                    key={q.id}
                    className="border rounded-xl p-3.5 bg-card shadow-xs space-y-3 relative transition-all"
                  >
                    {/* Collapsible Card Header */}
                    <div className="flex items-center justify-between gap-2 border-b pb-2.5">
                      <button
                        type="button"
                        onClick={() => toggleQuestionCollapse(q.id)}
                        className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity flex-1 min-w-0"
                      >
                        <Badge variant="secondary" className="font-mono text-xs shrink-0">
                          Question {qIndex + 1}
                        </Badge>
                        <span className="text-xs text-foreground font-medium truncate flex-1">
                          {q.question.trim() ? q.question : 'Untitled Question (Click to expand & edit)'}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">
                          &bull; {q.options.length} Options
                        </span>
                        {isCollapsed ? (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleQuestionCollapse(q.id)}
                          className="h-7 text-[11px] px-2 text-muted-foreground"
                        >
                          {isCollapsed ? 'Expand' : 'Collapse'}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          title="Remove question"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Question Content (Hidden when collapsed) */}
                    {!isCollapsed && (
                      <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                        {/* Question Stem / Text */}
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold">
                            Question Text <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={q.question}
                            onChange={(e) =>
                              setQuizForm({
                                ...quizForm,
                                questions: quizForm.questions.map((item) =>
                                  item.id === q.id ? { ...item, question: e.target.value } : item
                                ),
                              })
                            }
                            placeholder="Enter Question Text"
                            className="text-xs h-9 placeholder:text-xs placeholder:text-muted-foreground/50"
                          />
                        </div>

                        {/* Options List with Correct Answer Radio Button */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-semibold text-foreground">
                              Answer Options (Select correct answer)
                            </Label>
                            <span className="text-[10px] text-muted-foreground">
                              Selected: Option {String.fromCharCode(65 + q.correct_option_index)}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {q.options.map((opt, optIndex) => {
                              const isCorrect = q.correct_option_index === optIndex;
                              const optionLetter = String.fromCharCode(65 + optIndex);

                              return (
                                <div
                                  key={opt.id}
                                  className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${
                                    isCorrect
                                      ? 'border-emerald-500/50 bg-emerald-500/5'
                                      : 'border-border bg-background'
                                  }`}
                                >
                                  {/* Radio selector to mark this option as correct */}
                                  <label
                                    className="flex items-center gap-1.5 cursor-pointer shrink-0"
                                    title="Mark as correct answer"
                                  >
                                    <input
                                      type="radio"
                                      name={`correct_ans_${q.id}`}
                                      checked={isCorrect}
                                      onChange={() =>
                                        setQuizForm({
                                          ...quizForm,
                                          questions: quizForm.questions.map((item) =>
                                            item.id === q.id
                                              ? { ...item, correct_option_index: optIndex }
                                              : item
                                          ),
                                        })
                                      }
                                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                                    />
                                    <span
                                      className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                                        isCorrect
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      {optionLetter}
                                    </span>
                                  </label>

                                  {/* Option text */}
                                  <Input
                                    value={opt.text}
                                    onChange={(e) =>
                                      setQuizForm({
                                        ...quizForm,
                                        questions: quizForm.questions.map((item) =>
                                          item.id === q.id
                                            ? {
                                                ...item,
                                                options: item.options.map((o, idx) =>
                                                  idx === optIndex ? { ...o, text: e.target.value } : o
                                                ),
                                              }
                                            : item
                                        ),
                                      })
                                    }
                                    placeholder={`Option ${optionLetter} text...`}
                                    className={`text-xs h-8 placeholder:text-xs placeholder:text-muted-foreground/50 ${
                                      isCorrect ? 'font-medium' : ''
                                    }`}
                                  />

                                  {/* Remove Option Button */}
                                  {q.options.length > 2 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveOption(q.id, optIndex)}
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                      title="Remove option"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {q.options.length < 6 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddOption(q.id)}
                              className="h-7 text-xs text-primary hover:text-primary/80 gap-1 pl-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add Option ({String.fromCharCode(65 + q.options.length)})
                            </Button>
                          )}
                        </div>

                        {/* Answer Explanation */}
                        <div className="space-y-1 pt-1 border-t">
                          <Label className="text-[11px] font-semibold text-muted-foreground">
                            Answer Explanation / Clinical Rationale (Optional)
                          </Label>
                          <textarea
                            rows={2}
                            value={q.explanation || ''}
                            onChange={(e) =>
                              setQuizForm({
                                ...quizForm,
                                questions: quizForm.questions.map((item) =>
                                  item.id === q.id ? { ...item, explanation: e.target.value } : item
                                ),
                              })
                            }
                            placeholder="Explain why the selected option is correct. Displayed to students in exam review..."
                            className="w-full rounded-md border border-input bg-background p-2 text-xs placeholder:text-xs placeholder:text-muted-foreground/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Dialog Footer */}
          <DialogFooter className="px-6 py-3 border-t bg-muted/20 gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSaving}
              onClick={handleSaveQuiz}
              className="shadow-sm gap-1.5"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingQuizId ? 'Save Changes' : 'Create Quiz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------------------------- */}
      {/* PREVIEW QUIZ MODAL: View Questions and Correct Answers */}
      {/* -------------------------------------------------------------------------------- */}
      <Dialog open={previewQuiz !== null} onOpenChange={() => setPreviewQuiz(null)}>
        <DialogContent className="max-w-xl w-[95vw] sm:w-full max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl">
          <DialogHeader className="px-6 pt-5 pb-3 border-b">
            <DialogTitle className="text-base sm:text-lg flex items-center justify-between pr-4">
              <span className="truncate">{previewQuiz?.title}</span>
              <Badge variant="outline" className="text-xs text-primary font-mono shrink-0">
                {previewQuiz?.passing_score}% Pass
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Time Limit: {previewQuiz?.time_limit_minutes} minutes &bull;{' '}
              {previewQuiz?.questions?.length ?? previewQuiz?.total_questions} Questions
            </DialogDescription>
          </DialogHeader>

          {previewQuiz && (
            <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1 text-xs">
              {previewQuiz.instructions && (
                <div className="p-3 bg-muted/30 rounded-lg border text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground mb-1">Instructions:</p>
                  {previewQuiz.instructions}
                </div>
              )}

              <div className="space-y-4">
                {(previewQuiz.questions || []).map((q, idx) => (
                  <div key={q.id} className="p-3.5 border rounded-xl bg-card space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="font-mono text-[10px] shrink-0 mt-0.5">
                        Q{idx + 1}
                      </Badge>
                      <p className="font-semibold text-foreground text-xs leading-normal">
                        {q.question}
                      </p>
                    </div>

                    {/* Options list */}
                    <div className="space-y-1.5 pl-6">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correct_option_index === optIdx;
                        const optionLetter = String.fromCharCode(65 + optIdx);

                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-2 p-2 rounded-md text-xs ${
                              isCorrect
                                ? 'bg-emerald-500/10 border border-emerald-500/30 font-medium text-emerald-950 dark:text-emerald-300'
                                : 'bg-muted/20 border border-transparent text-muted-foreground'
                            }`}
                          >
                            <span className="font-mono font-bold">{optionLetter}.</span>
                            <span className="flex-1">{opt.text}</span>
                            {isCorrect && (
                              <Badge className="bg-emerald-600 text-white text-[10px] h-4 px-1 gap-0.5 shrink-0">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Correct
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="ml-6 p-2 rounded bg-muted/40 border text-[11px] text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Rationale: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="px-6 py-3 border-t bg-muted/20">
            <Button size="sm" onClick={() => setPreviewQuiz(null)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* -------------------------------------------------------------------------------- */}
      <Dialog open={deleteQuizId !== null} onOpenChange={() => setDeleteQuizId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quiz? Modules linking to this quiz will no longer have an attached assessment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeleteQuizId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              className="gap-1.5"
              onClick={() => deleteQuizId && handleDeleteQuiz(deleteQuizId)}
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
