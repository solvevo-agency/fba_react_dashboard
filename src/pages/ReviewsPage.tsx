import { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Search,
  Trash2,
  Eye,
  AlertTriangle,
  Award,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  reviewApi,
  type ReviewItem,
  type ReviewMetrics,
} from '@/services/reviewApi';
import { getApiErrorMessage } from '@/services/api';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [metrics, setMetrics] = useState<ReviewMetrics>({
    total_reviews: 0,
    average_rating: 5.0,
    five_star_count: 0,
    top_satisfaction_percentage: 100,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected review for view modal
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);

  // Delete modal state
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load reviews and metrics from backend
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [metricsData, reviewsData] = await Promise.all([
        reviewApi.getMetrics(),
        reviewApi.getAll(searchQuery),
      ]);
      setMetrics(metricsData);
      setReviews(reviewsData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load course reviews'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      setIsDeleting(true);
      await reviewApi.delete(reviewToDelete.id);

      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));

      if (selectedReview?.id === reviewToDelete.id) {
        setSelectedReview(null);
      }

      // Refresh metrics
      const updatedMetrics = await reviewApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success('Review deleted successfully');
      setReviewToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete review'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            Course Reviews & Testimonials
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor student feedback, course ratings, and evaluate learner testimonials
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={isLoading}
          className="h-8 text-xs gap-1.5 self-end sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Total Reviews</CardDescription>
            <CardTitle className="text-2xl font-bold">{metrics.total_reviews}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" />
              Verified student submissions
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Average Rating</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-500 flex items-center gap-1.5">
              {metrics.average_rating.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground">/ 5.0</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.round(metrics.average_rating)
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
              <span className="text-[11px] text-muted-foreground ml-1.5">Platform Average</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">5-Star Feedback</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.five_star_count}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              {metrics.total_reviews > 0
                ? `${metrics.top_satisfaction_percentage}% top satisfaction score`
                : '100% top satisfaction'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by student, course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 text-xs h-9 placeholder:text-xs"
        />
      </div>

      {/* Clean, Responsive Table (Only Student, Course, Rating, Date, Action) */}
      <Card className="border shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[850px] w-full text-xs">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="min-w-[200px] whitespace-nowrap text-xs font-semibold">
                  Student Name
                </TableHead>
                <TableHead className="min-w-[260px] whitespace-nowrap text-xs font-semibold">
                  Course Name
                </TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap text-xs font-semibold">
                  Rating
                </TableHead>
                <TableHead className="min-w-[130px] whitespace-nowrap text-xs font-semibold">
                  Date
                </TableHead>
                <TableHead className="w-[120px] min-w-[120px] whitespace-nowrap text-xs font-semibold text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                    Loading student course reviews...
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-xs text-muted-foreground">
                    No reviews match your search query.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-muted/30 transition-colors">
                    {/* 1. Student Name */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 ring-1 ring-border">
                          {review.student_avatar && <AvatarImage src={review.student_avatar} alt={review.student_name} />}
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {review.student_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-semibold text-foreground text-xs block">
                            {review.student_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {review.student_email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* 2. Course Name */}
                    <TableCell className="whitespace-nowrap">
                      <p
                        className="text-xs font-medium text-foreground max-w-[280px] truncate"
                        title={review.course_title}
                      >
                        {review.course_title}
                      </p>
                    </TableCell>

                    {/* 3. Rating Number (e.g. 4 or 5) */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono text-foreground">
                          {review.rating} / 5
                        </span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-muted-foreground/25'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    {/* 4. Date */}
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {review.created_at}
                    </TableCell>

                    {/* 5. Action (View Details & Delete) */}
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReview(review)}
                          className="h-8 px-2.5 text-xs gap-1.5 text-foreground hover:bg-muted"
                          title="View full review details"
                        >
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          View
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setReviewToDelete(review)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete review"
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

      {/* Review Details Modal */}
      <Dialog
        open={selectedReview !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedReview(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center justify-between pr-6">
              <span>Student Review Details</span>
              {selectedReview && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-mono gap-1"
                >
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {selectedReview.rating} / 5 Stars
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete testimonial text submitted by learner
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4 py-2 text-xs">
              {/* Student & Course Header Card */}
              <div className="flex items-center gap-3 p-3.5 bg-muted/30 border rounded-xl">
                <Avatar className="h-11 w-11 ring-1 ring-border shrink-0">
                  {selectedReview.student_avatar && (
                    <AvatarImage src={selectedReview.student_avatar} alt={selectedReview.student_name} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {selectedReview.student_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-bold text-sm text-foreground">
                    {selectedReview.student_name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate" title={selectedReview.course_title}>
                    {selectedReview.course_title}
                  </p>
                  <p className="text-[11px] text-muted-foreground pt-0.5">
                    Submitted on: {selectedReview.created_at}
                  </p>
                </div>
              </div>

              {/* Review Headline & Full Content */}
              <div className="border rounded-xl p-4 bg-background space-y-2">
                <div className="flex items-center gap-1.5 pb-1 border-b">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedReview.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-muted-foreground/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-foreground text-xs ml-1">
                    &ldquo;{selectedReview.review_title}&rdquo;
                  </span>
                </div>

                <div className="pt-1">
                  <p className="text-xs leading-relaxed text-foreground whitespace-pre-line">
                    {selectedReview.review_text}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedReview(null)}
              className="h-9 text-xs"
            >
              Close
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (selectedReview) {
                  setReviewToDelete(selectedReview);
                }
              }}
              className="h-9 text-xs font-medium gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={reviewToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setReviewToDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Review
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete this student review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {reviewToDelete && (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-1.5 my-2 text-xs">
              <p className="font-semibold text-foreground">
                Review by: {reviewToDelete.student_name}
              </p>
              <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                &ldquo;{reviewToDelete.review_text}&rdquo;
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReviewToDelete(null)}
              disabled={isDeleting}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-9 text-xs font-medium gap-1.5"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <Trash2 className="h-3.5 w-3.5" />
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
