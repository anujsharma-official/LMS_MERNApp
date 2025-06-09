import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  useEditLectureMutation,
  useGetLectureByIdQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const MEDIA_API = `${backendUrl}/api/v1/media`;

// Helper to format speed in B/s, KB/s, or MB/s
const formatSpeed = (bytesPerSec) => {
  if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(1)} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
};

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [btnDisable, setBtnDisable] = useState(true);
  const params = useParams();
  const { courseId, lectureId } = params;

  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo(lecture.videoInfo);
    }
  }, [lecture]);

  const [edtiLecture, { data, isLoading, error, isSuccess }] =
    useEditLectureMutation();
  const [
    removeLecture,
    { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess },
  ] = useRemoveLectureMutation();

  // FILE UPLOAD HANDLER WITH HIGH-ACCURACY PROGRESS & SPEED
  const fileChangeHandler = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  setMediaProgress(true);
  setUploadProgress(0);
  setUploadSpeed("");
  setBtnDisable(true);

  let lastLoaded = 0;
  let lastTime = Date.now();

  try {
    const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: ({ loaded, total }) => {
        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000; // seconds

        // Avoid division by zero and very small intervals
        if (timeDiff > 0.1) {
          const bytesDiff = loaded - lastLoaded;
          const speedBps = bytesDiff / timeDiff;

          // Update speed string
          const speedStr = formatSpeed(speedBps);
          setUploadSpeed(speedStr);

          lastLoaded = loaded;
          lastTime = now;
        }

        const percent = Math.round((loaded * 100) / total);
        setUploadProgress(percent);
      },
    });

    if (res.data.success) {
      setUploadVideoInfo({
        videoUrl: res.data.data.url,
        publicId: res.data.data.public_id,
      });
      setBtnDisable(false);
      toast.success(res.data.message);
    }
  } catch (error) {
    console.error(error);
    toast.error("Video upload failed");
  } finally {
    setMediaProgress(false);
  }
};


  // Edit lecture API call
  const editLectureHandler = async () => {
    await edtiLecture({
      lectureTitle,
      videoInfo: uploadVideInfo,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    });
  };

  // Delete lecture handler
  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  };

  useEffect(() => {
    if (isSuccess) toast.success(data.message);
    if (error) toast.error(error.data.message);
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeSuccess) toast.success(removeData.message);
  }, [removeSuccess]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>Make changes and click save when done.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={removeLoading}
            variant="destructive"
            onClick={removeLectureHandler}
          >
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Remove Lecture"
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>

        <div className="my-5">
          <Label>
            Video <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={fileChangeHandler}
            className="w-fit"
          />
        </div>

        <div className="flex items-center space-x-2 my-5">
          <Switch checked={isFree} onCheckedChange={setIsFree} id="airplane-mode" />
          <Label htmlFor="airplane-mode">Is this video FREE</Label>
        </div>

        {/* Upload Progress & Speed */}
        {mediaProgress && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p className="text-sm mt-1">
              {uploadProgress}% uploaded
              {uploadSpeed && <span className="ml-2 text-gray-500">Speed: {uploadSpeed}</span>}
            </p>
          </div>
        )}

        <div className="mt-4">
          <Button disabled={isLoading || btnDisable} onClick={editLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Update Lecture"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
