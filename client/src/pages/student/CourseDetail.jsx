import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React, { useState } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);

  const [currentLecture, setCurrentLecture] = useState(null);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Failed to load course details</h1>;

  const { course, purchased } = data;

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  const canPlayVideo = (lecture) => {
    return purchased || lecture.isPreviewFree;
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course?.courseTitle}
          </h1>
          <p className="text-base md:text-lg">Course Sub-title</p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator.name}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated {course?.createdAt.split("T")[0]}</p>
          </div>
          <p>Students enrolled: {course?.enrolledStudents.length}</p>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {course.lectures.length}{" "}
                {course.lectures.length === 1 ? "lecture" : "lectures"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.map((lecture, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    canPlayVideo(lecture)
                      ? setCurrentLecture(lecture)
                      : toast.error("Buy the course to watch this lecture")
                  }
                  className="flex items-center gap-3 text-sm w-full text-left hover:bg-gray-100 p-2 rounded-md dark:hover:bg-gray-800 transition"
                >
                  <span>
                    {canPlayVideo(lecture) ? (
                      <PlayCircle size={16} className="text-green-600" />
                    ) : (
                      <Lock size={16} className="text-gray-500" />
                    )}
                  </span>
                  <p>{lecture.lectureTitle}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4">
                {currentLecture && canPlayVideo(currentLecture) ? (
                  <ReactPlayer
                     width="100%"
                  height={"100%"}
                    url={currentLecture.videoUrl}
                    controls
                    config={{
                      file: {
                        attributes: {
                          controlsList: "nodownload", // Prevent download option
                          disablePictureInPicture: true, // Disable PiP
                        },
                      },}}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                    <p>Select a free lecture or purchase to unlock</p>
                  </div>
                )}
              </div>

              <h1>
                Lecture title –{" "}
                <strong>
                  {currentLecture?.lectureTitle || "No lecture selected"}
                </strong>
              </h1>

              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold">
                Course Price – ₹{course.coursePrice}
              </h1>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              {purchased ? (
                <Button onClick={handleContinueCourse} className="w-full">
                  Continue Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
