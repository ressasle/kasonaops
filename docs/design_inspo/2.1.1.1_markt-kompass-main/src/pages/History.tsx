import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Upload, FileText, Pencil, Eye, Plus, Lightbulb, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Review {
  id: string;
  quarter: string;
  year: number;
  created_at: string;
  review_data: any;
}

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  // Upload Dialog states
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadQuarter, setUploadQuarter] = useState("Q4");
  const [uploadYear, setUploadYear] = useState(2024);
  const [uploadingNewReview, setUploadingNewReview] = useState(false);
  
  // Active thoughts states
  const [showThoughtsField, setShowThoughtsField] = useState(false);
  const [activeQuarterThoughts, setActiveQuarterThoughts] = useState("");

  const fetchReviews = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("quarterly_reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: false })
        .order("quarter", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      toast({
        title: t('history.loadError'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, t]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Load thoughts from localStorage
  useEffect(() => {
    const savedThoughts = localStorage.getItem('active_quarter_thoughts');
    if (savedThoughts) {
      setActiveQuarterThoughts(savedThoughts);
    }
  }, []);

  // Auto-save thoughts to localStorage
  useEffect(() => {
    localStorage.setItem('active_quarter_thoughts', activeQuarterThoughts);
  }, [activeQuarterThoughts]);

  // Upload past review with PDF
  const handleUploadPastReview = async (file: File) => {
    if (!user) return;
    setUploadingNewReview(true);
    
    try {
      // Upload PDF to storage
      const filePath = `${user.id}/${uploadQuarter}_${uploadYear}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('review-pdfs')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('review-pdfs')
        .getPublicUrl(filePath);
      
      // Create review entry
      const { error: insertError } = await supabase.from('quarterly_reviews').upsert({
        user_id: user.id,
        quarter: uploadQuarter,
        year: uploadYear,
        review_data: {
          is_uploaded: true,
          document_name: file.name,
          document_url: urlData.publicUrl,
          uploaded_at: new Date().toISOString()
        }
      }, { onConflict: 'user_id,quarter,year' });
      
      if (insertError) throw insertError;

      // Refresh reviews
      await fetchReviews();
      setShowUploadDialog(false);
      
      toast({
        title: t('history.uploadSuccess'),
        description: `${file.name} ${t('history.uploadSuccessDesc')}`,
      });
    } catch (error: any) {
      toast({
        title: t('history.uploadError'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingNewReview(false);
    }
  };

  const formatReviewDataForDisplay = (reviewData: any) => {
    if (!reviewData) return [];
    
    const fieldLabels: Record<string, string> = {
      quarterKeywords: t('newReview.q0_keywords'),
      dominantEvent: t('newReview.q0_event'),
      surprisinglyStable: t('newReview.q0_stable'),
      personalInsight: t('newReview.q0_insight'),
      currencyNotes: t('newReview.q1_notes'),
      currencyReflection: t('newReview.q1_reflection'),
      preciousMetalsNotes: t('newReview.q2_notes'),
      preciousMetalsReflection: t('newReview.q2_reflection'),
      oilNotes: t('newReview.q3_notes'),
      oilReflection: t('newReview.q3_reflection'),
      commoditiesNotes: t('newReview.q4_notes'),
      commoditiesReflection: t('newReview.q4_reflection'),
      indicesNotes: t('newReview.q5_notes'),
      indicesReflection: t('newReview.q5_reflection'),
      stocksNotes: t('newReview.q6_notes'),
      stocksReflection: t('newReview.q6_reflection'),
      strengthens: t('newReview.q7_strengthens'),
      uncertainties: t('newReview.q7_uncertainties'),
      nextQuarterChanges: t('newReview.q7_changes'),
    };

    return Object.entries(reviewData)
      .filter(([key, value]) => value && typeof value === 'string' && value.trim() !== '' && !key.includes('document') && !key.includes('uploaded') && key !== 'is_uploaded')
      .map(([key, value]) => ({
        label: fieldLabels[key] || key,
        value: value as string,
      }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-abril text-3xl mb-2">
                {t('history.title')}
              </h2>
              <p className="text-muted-foreground">
                {loading ? t('history.loading') : `${reviews.length} ${t('history.reviewsCount')}`}
              </p>
            </div>
            <Button onClick={() => navigate("/new-review")} className="shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              {t('history.newReview')}
            </Button>
          </div>

          {/* Collect Thoughts Card - Active Quarter */}
          <Card className="border-dashed border-2 border-primary/30 mb-6">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-6 w-6 text-primary" />
                  <h3 className="font-anton text-lg">{t('history.collectThoughtsActive')}</h3>
                </div>
                <Button 
                  variant={showThoughtsField ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowThoughtsField(!showThoughtsField)}
                >
                  {showThoughtsField ? (
                    <>
                      <ChevronUp className="mr-1 h-4 w-4" />
                      {t('common.close')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 h-4 w-4" />
                      {t('history.startCollecting')}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{t('history.collectThoughtsDesc')}</p>
              
              {showThoughtsField && (
                <div className="space-y-2">
                  <Textarea
                    value={activeQuarterThoughts}
                    onChange={(e) => setActiveQuarterThoughts(e.target.value)}
                    placeholder={t('history.thoughtsPlaceholder')}
                    rows={6}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    💾 {t('newReview.autoSaveHint')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">{t('history.loading')}</p>
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 text-accent mx-auto mb-4" />
                <h3 className="font-anton text-xl mb-2">{t('history.noReviews')}</h3>
                <p className="text-muted-foreground mb-6">
                  {t('history.startFirst')}
                </p>
                <Button onClick={() => navigate("/new-review")}>
                  {t('history.newReview')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const isUploaded = review.review_data?.is_uploaded;
                
                return (
                  <Card key={review.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="font-anton">
                          {review.quarter} {review.year}
                        </span>
                        <div className="flex items-center gap-2">
                          {isUploaded && (
                            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                              PDF
                            </span>
                          )}
                          <Calendar className="h-5 w-5 text-accent" />
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {t('history.createdOn')} {new Date(review.created_at).toLocaleDateString("de-DE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {review.review_data?.document_name && (
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <FileText className="h-4 w-4 text-accent" />
                            <span className="text-sm text-muted-foreground flex-1 truncate">
                              {review.review_data.document_name}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            className="flex-1 min-w-[120px]"
                            onClick={() => setSelectedReview(review)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {t('history.viewReview')}
                          </Button>
                          
                          {/* Only show edit button for non-uploaded reviews */}
                          {!isUploaded && (
                            <Button 
                              variant="outline" 
                              className="flex-1 min-w-[120px]"
                              onClick={() => navigate(`/new-review?edit=${review.quarter}&year=${review.year}`)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {t('history.restartReview')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Upload Past Review Button */}
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => setShowUploadDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              {t('history.uploadPastReview')}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Upload Past Review Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('history.uploadPastReview')}</DialogTitle>
            <DialogDescription>{t('history.selectQuarterForUpload')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-2 block">Quartal</Label>
                <Select value={uploadQuarter} onValueChange={setUploadQuarter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-2 block">Jahr</Label>
                <Select value={uploadYear.toString()} onValueChange={(v) => setUploadYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2025, 2024, 2023, 2022].map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center relative cursor-pointer hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={uploadingNewReview}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadPastReview(file);
                }}
              />
              {uploadingNewReview ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto pointer-events-none"></div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground pointer-events-none" />
                  <p className="text-muted-foreground pointer-events-none">{t('history.clickToUploadPDF')}</p>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Detail Modal */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-anton text-xl">
              {selectedReview?.quarter} {selectedReview?.year}
            </DialogTitle>
            <DialogDescription>
              {selectedReview && t('history.createdOn')} {selectedReview && new Date(selectedReview.created_at).toLocaleDateString("de-DE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedReview?.review_data?.document_url ? (
              // PDF mit Google Docs Viewer anzeigen
              <div className="space-y-4">
                {/* PDF Info Header */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {selectedReview.review_data.document_name || 'Review PDF'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedReview.review_data.document_url, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('history.openPDF')}
                  </Button>
                </div>
                
                {/* Google Docs Viewer für inline PDF */}
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedReview.review_data.document_url)}&embedded=true`}
                  className="w-full h-[55vh] rounded-md border"
                  title={`${selectedReview.quarter} ${selectedReview.year} Review`}
                />
              </div>
            ) : (
              // Fallback: Review-Daten als Text anzeigen
              <div className="space-y-4 pr-4">
                {selectedReview && formatReviewDataForDisplay(selectedReview.review_data).length > 0 ? (
                  formatReviewDataForDisplay(selectedReview.review_data).map((item, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">{item.label}</Label>
                      <p className="text-foreground bg-muted/50 p-3 rounded-md">{item.value}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">{t('history.noNotesYet')}</p>
                    {selectedReview && !selectedReview.review_data?.is_uploaded && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const review = selectedReview;
                          setSelectedReview(null);
                          navigate(`/new-review?edit=${review.quarter}&year=${review.year}`);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {t('history.addNotes')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setSelectedReview(null)}
            >
              {t('history.closeModal')}
            </Button>
            {selectedReview && !selectedReview.review_data?.is_uploaded && (
              <Button 
                className="flex-1"
                onClick={() => {
                  if (selectedReview) {
                    navigate(`/new-review?edit=${selectedReview.quarter}&year=${selectedReview.year}`);
                  }
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t('history.restartReview')}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
