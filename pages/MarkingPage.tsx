
import React, { useState, useEffect, useCallback } from 'react';
import type { TaskType, Feedback, Improvement, EssayImage } from '../types';
import { getIeltsFeedback, transcribeEssayImage } from '../services/geminiService';
import { Spinner } from '../components/Spinner';
import FeedbackDisplay from '../components/FeedbackDisplay';
import { AnnotationPopover } from '../components/AnnotationPopover';
import { ImagePreviewList } from '../components/ImagePreviewList';
import { ImageCropperModal } from '../components/ImageCropperModal';

interface MarkingPageProps {
  taskType: TaskType;
  user: { name: string; center: string; };
}

interface AnnotationTarget {
  rect: DOMRect;
  text: string;
}

const loadingMessages = [
  'Booting up the AI examiner...',
  'Reading the essay for initial impressions...',
  'Analyzing overall essay structure...',
  'Evaluating task response against the prompt...',
  'Assessing coherence and cohesion...',
  'Checking the range and precision of vocabulary...',
  'Reviewing grammatical accuracy and sentence structure...',
  'Compiling the detailed feedback report...',
  'Finalizing the band scores...',
  'Almost there, just polishing the suggestions...'
];

// Helper function to convert a data URL to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL: MIME type not found.');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

const MarkingPage: React.FC<MarkingPageProps> = ({ taskType, user }) => {
  const [studentName, setStudentName] = useState('');
  const [classNameVal, setClassNameVal] = useState('');
  const [question, setQuestion] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [image, setImage] = useState<{ file: File; base64: string; mimeType: string } | null>(null); // For Task 1 Visual
  const [essayImages, setEssayImages] = useState<EssayImage[]>([]); // For Essay Transcription
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [transcriptionMessage, setTranscriptionMessage] = useState('');
  const [annotationTarget, setAnnotationTarget] = useState<AnnotationTarget | null>(null);
  const [croppingImage, setCroppingImage] = useState<EssayImage | null>(null);


  useEffect(() => {
    if (isLoading) {
        let messageIndex = 0;
        const interval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 2500);

        return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64String = (reader.result as string).split(',')[1];
          setImage({ file, base64: base64String, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleEssayImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setTranscriptionError(null);

    const newImagesPromises = Array.from(files).map((file: File, index) => {
        return new Promise<EssayImage>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    const base64String = (reader.result as string).split(',')[1];
                    resolve({
                        id: Date.now() + index,
                        file,
                        base64: base64String,
                        mimeType: file.type,
                    });
                } else {
                    reject(new Error(`Failed to read file ${file.name} as a data URL.`));
                }
            };
            reader.onerror = () => reject(reader.error || new Error(`An error occurred reading file ${file.name}`));
            reader.readAsDataURL(file);
        });
    });

    try {
        const newImages = await Promise.all(newImagesPromises);
        setEssayImages(prevImages => [...prevImages, ...newImages]);
    } catch (err) {
        setTranscriptionError(err instanceof Error ? err.message : `Failed to read one or more files.`);
    }
    
    if (e.target) {
        e.target.value = ''; // Reset file input
    }
  };

  const handleRemoveEssayImage = (idToRemove: number) => {
    setEssayImages(prev => prev.filter(image => image.id !== idToRemove));
  };

  const handleStartTranscription = async () => {
    if (essayImages.length === 0) return;

    setIsTranscribing(true);
    setTranscriptionError(null);
    setStudentAnswer('');
    let combinedText = '';

    for (let i = 0; i < essayImages.length; i++) {
        const image = essayImages[i];
        setTranscriptionMessage(`Transcribing page ${i + 1} of ${essayImages.length}...`);
        try {
            const transcribedText = await transcribeEssayImage(image.base64, image.mimeType);
            combinedText += (i > 0 ? '\n\n' : '') + transcribedText;
            setStudentAnswer(combinedText); // Live update textarea
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : `Failed to transcribe image ${i + 1}.`;
            setTranscriptionError(`Error on page ${i+1}: ${errorMessage}`);
            setIsTranscribing(false);
            return;
        }
    }

    setEssayImages([]); // Clear images after successful transcription
    setIsTranscribing(false);
    setTranscriptionMessage('');
  };

  const handleStartCrop = (imageToCrop: EssayImage) => {
    setCroppingImage(imageToCrop);
  };

  const handleCancelCrop = () => {
    setCroppingImage(null);
  };

  const handleSaveCrop = (id: number, newDataUrl: string) => {
    const originalImage = essayImages.find(img => img.id === id);
    if (!originalImage) return;

    try {
        const newFile = dataURLtoFile(newDataUrl, originalImage.file.name);
        const newBase64 = newDataUrl.split(',')[1];

        const updatedImages = essayImages.map(img =>
          img.id === id
            ? { ...img, file: newFile, base64: newBase64, mimeType: newFile.type }
            : img
        );
        setEssayImages(updatedImages);
        setCroppingImage(null); // Close modal
    } catch (err) {
        console.error("Failed to process cropped image:", err);
        setTranscriptionError(err instanceof Error ? err.message : "Could not process the cropped image.");
        setCroppingImage(null); // Still close modal on error
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !classNameVal.trim()) {
      setError("Please fill in the Student Name and Class Name fields.");
      return;
    }
    if (!question.trim() || !studentAnswer.trim()) {
      setError('Please fill in both the question and the student\'s answer.');
      return;
    }
    if (taskType === 1 && !image) {
      setError('Please upload an image for Task 1.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage(loadingMessages[0]);

    try {
      const result = await getIeltsFeedback(
        taskType,
        question,
        studentAnswer,
        image?.base64 ?? null,
        image?.mimeType
      );
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        const selectedText = selection.toString().trim();
        if (selectedText.length > 2) {
            const range = selection.getRangeAt(0);
            setAnnotationTarget({ rect: range.getBoundingClientRect(), text: selectedText });
        }
    }
  }, []);

  const handleAnnotationSave = (newImprovement: Omit<Improvement, 'id' |'originalText' | 'source' | 'suggestions'> & { suggestions: string }) => {
    if (!feedback || !annotationTarget) return;

    const finalImprovement: Improvement = {
        ...newImprovement,
        id: Date.now(),
        suggestions: [newImprovement.suggestions],
        originalText: annotationTarget.text,
        source: 'Teacher',
    };
    
    setFeedback({
        ...feedback,
        improvements: [...feedback.improvements, finalImprovement],
    });

    setAnnotationTarget(null);
  };

  const handleImprovementUpdate = (updatedImprovement: Improvement) => {
    if (!feedback) return;

    const improvementIndex = feedback.improvements.findIndex(imp => imp.id === updatedImprovement.id);
    if (improvementIndex === -1) return;

    const newImprovements = [...feedback.improvements];
    newImprovements[improvementIndex] = updatedImprovement;

    setFeedback({
        ...feedback,
        improvements: newImprovements
    });
  };


  const calculateOverallBand = (scores: number[]): number => {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average * 2) / 2;
  };

  const handleScoreChange = (
      criterion: keyof Feedback['feedback'], 
      newBand: number
  ) => {
      if (!feedback) return;

      const updatedFeedbackCriteria = {
          ...feedback.feedback,
          [criterion]: { ...feedback.feedback[criterion], band: newBand }
      };
      
      const newOverallBand = calculateOverallBand([
          updatedFeedbackCriteria.taskResponse.band,
          updatedFeedbackCriteria.coherenceCohesion.band,
          updatedFeedbackCriteria.lexicalResource.band,
          updatedFeedbackCriteria.grammaticalRangeAccuracy.band,
      ]);

      setFeedback({
          ...feedback,
          overallBand: newOverallBand,
          feedback: updatedFeedbackCriteria,
      });
  };

  const wordCount = studentAnswer.trim().split(/\s+/).filter(Boolean).length;
  const isFormInvalid = !studentName.trim() || !classNameVal.trim() || !question.trim() || !studentAnswer.trim() || (taskType === 1 && !image);
  
  const getTooltipMessage = () => {
    const missingFields: string[] = [];
    if (!studentName.trim()) missingFields.push("Student Name");
    if (!classNameVal.trim()) missingFields.push("Class Name");
    if (!question.trim()) missingFields.push("Question");
    if (!studentAnswer.trim()) missingFields.push("Student's Answer");
    if (taskType === 1 && !image) missingFields.push("Task 1 Image");

    if (missingFields.length > 0) {
        return `Please complete all required fields: ${missingFields.join(', ')}`;
    }
    return '';
  };

  // Reusable Styles
  const labelClasses = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1";
  const inputClasses = "w-full px-5 py-3 bg-white/60 border border-slate-200/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm shadow-sm";

  return (
    <div className="relative animate-fade-in pb-12">
      {/* Background Blobs for Depth */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply"></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply"></div>

      <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
             Writing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Task {taskType}</span>
          </h1>
          <p className="text-lg text-slate-500 mt-2 font-medium">
            {taskType === 1
            ? 'Analyze visual data. Upload the chart/graph and input the student essay.'
            : 'Evaluate discursive essays. Input the prompt and student argument.'}
          </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl mx-auto">
        
        {/* Section 1: Student Details */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl relative overflow-hidden border border-white/60">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30"></div>
            <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-extrabold">01</span>
                Student & Class Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label htmlFor="student-name" className={labelClasses}>Student Name</label>
                    <input
                        type="text"
                        id="student-name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g., John Doe"
                        className={inputClasses}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="class-name" className={labelClasses}>Class Name</label>
                    <input
                        type="text"
                        id="class-name"
                        value={classNameVal}
                        onChange={(e) => setClassNameVal(e.target.value)}
                        placeholder="e.g., IELTS Prep - Section A"
                        className={inputClasses}
                        required
                    />
                </div>
            </div>
        </div>

        {/* Section 2: Task Details */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl relative overflow-hidden border border-white/60">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/30 to-purple-500/30"></div>
            <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm font-extrabold">02</span>
                Writing Task
            </h2>
             <div className="space-y-8">
                <div>
                    <label htmlFor="question" className={labelClasses}>Writing Task Question</label>
                    <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={`e.g., "The chart below shows the changes in three different areas of crime in Manchester city centre from 2003-2012."`}
                    className={inputClasses}
                    rows={3}
                    required
                    />
                </div>

                {taskType === 1 && (
                    <div>
                    <label className={labelClasses}>Upload Visual (Graph/Chart)</label>
                    <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-indigo-200/60 rounded-2xl bg-indigo-50/30 hover:bg-indigo-50/50 transition-colors duration-300">
                        {image ? (
                        <div className="text-center">
                            <div className="relative inline-block group">
                                <img 
                                src={`data:${image.mimeType};base64,${image.base64}`} 
                                alt="Task 1 Visual Preview" 
                                className="max-h-60 mx-auto rounded-xl shadow-lg border border-white/50"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium pointer-events-none">
                                    Change Image
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-3 font-medium uppercase tracking-wide">{image.file.name}</p>
                            <label htmlFor="image-upload" className="mt-4 cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                Replace File
                            </label>
                            <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                        </div>
                        ) : (
                        <div className="space-y-2 text-center">
                            <div className="mx-auto h-16 w-16 text-indigo-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-sm text-slate-600">
                                <label htmlFor="image-upload" className="relative cursor-pointer font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                </label>
                                <span className="pl-1">or drag and drop</span>
                            </div>
                            <p className="text-xs text-slate-400">PNG, JPG, GIF up to 10MB</p>
                        </div>
                        )}
                    </div>
                    </div>
                )}
             </div>
        </div>

        {/* Section 3: Student's Answer */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl relative overflow-hidden border border-white/60">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-700 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm font-extrabold">03</span>
                    Student's Answer
                </h2>
                <div>
                    <label htmlFor="essay-image-upload" className={`
                        inline-flex items-center px-5 py-2.5 rounded-xl shadow-sm text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:shadow-md hover:text-blue-600 transition-all duration-300
                        ${isTranscribing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Upload Essay Images</span>
                    </label>
                    <input 
                        id="essay-image-upload" 
                        name="essay-image-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleEssayImagesUpload} 
                        accept="image/*" 
                        disabled={isTranscribing}
                        multiple
                    />
                </div>
            </div>
            
            {transcriptionError && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-700 border border-red-200 rounded-xl text-sm font-medium animate-fade-in" role="alert">
                    {transcriptionError}
                </div>
            )}

            {essayImages.length > 0 && (
                <div className="mb-8 p-6 border border-slate-200/60 rounded-2xl bg-slate-50/50 backdrop-blur-sm">
                    <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Pages to Transcribe</div>
                    <ImagePreviewList 
                        images={essayImages}
                        onReorder={setEssayImages}
                        onRemove={handleRemoveEssayImage}
                        onEdit={handleStartCrop}
                    />
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={handleStartTranscription}
                            disabled={isTranscribing}
                            className="inline-flex items-center px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isTranscribing ? (
                                <>
                                    <Spinner />
                                    <span className="ml-2">{transcriptionMessage || 'Transcribing...'}</span>
                                </>
                            ) : (
                                `Transcribe ${essayImages.length} Page(s)`
                            )}
                        </button>
                    </div>
                </div>
            )}

            <div className="relative">
                <textarea
                id="student-answer"
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Paste the student's full essay here, or upload image(s) of the essay and click transcribe."
                className={inputClasses}
                rows={15}
                disabled={isTranscribing}
                required
                />
                <p className="text-right text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">{wordCount} words</p>
            </div>
        </div>

        <div className="pt-4 pb-8">
            {isLoading ? (
                <div className="w-full flex justify-center items-center py-5 px-6 rounded-2xl shadow-inner text-lg font-bold text-slate-600 bg-slate-100/50 border border-slate-200 backdrop-blur-sm transition-all duration-300">
                    <Spinner />
                    <span className="ml-3 text-slate-700">{loadingMessage}</span>
                </div>
            ) : (
                <div className="relative w-full group">
                    <button
                        type="submit"
                        disabled={isFormInvalid}
                        className="w-full flex justify-center py-5 px-6 rounded-3xl shadow-2xl shadow-blue-900/20 text-xl font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-1 hover:shadow-blue-600/40 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 active:scale-[0.99]"
                    >
                        Get Feedback
                    </button>
                    {isFormInvalid && (
                        <div 
                            role="tooltip"
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-max max-w-xs px-4 py-3 text-sm font-medium text-white bg-slate-800 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        >
                            {getTooltipMessage()}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800" aria-hidden="true"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </form>

      {error && (
          <div className="mt-8 mx-auto max-w-5xl p-6 bg-red-50/90 backdrop-blur-md text-red-800 border border-red-200 rounded-2xl shadow-lg animate-fade-in flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                  <h3 className="font-bold text-red-900">Analysis Error</h3>
                  <p className="mt-1 text-sm">{error}</p>
              </div>
          </div>
      )}
      
      {feedback && (
        <div className="mt-16 animate-fade-in">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-200/60 max-w-5xl mx-auto flex items-center">
                 <span className="w-2 h-10 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-4"></span>
                 Feedback Report
            </h2>
            <FeedbackDisplay 
                feedback={feedback} 
                studentAnswer={studentAnswer}
                question={question}
                studentName={studentName}
                classNameVal={classNameVal}
                teacherName={user.name}
                centerName={user.center}
                isLoading={isLoading}
                onScoreChange={handleScoreChange}
                onImprovementUpdate={handleImprovementUpdate}
                onTextSelect={handleTextSelect}
            />
        </div>
      )}

      {croppingImage && (
        <ImageCropperModal
          image={croppingImage}
          onSave={handleSaveCrop}
          onCancel={handleCancelCrop}
        />
      )}

      {annotationTarget && (
        <AnnotationPopover 
            targetRect={annotationTarget.rect}
            selectedText={annotationTarget.text}
            onSave={handleAnnotationSave}
            onCancel={() => setAnnotationTarget(null)}
        />
      )}
    </div>
  );
};

export default MarkingPage;
