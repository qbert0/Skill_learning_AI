(function registerPracticeDefaultSubpages() {
    PracticeInterfaceRegistry.registerSubpage({
        id: "list",
        breadcrumb: () => [],
        route: ({ skill }) => `#/practice/${encodeURIComponent(skill || "Foundation")}`,
        title: ({ skillLabel }) => skillLabel ? `Danh sách bài tập - ${skillLabel}` : "Danh sách bài tập"
    });

    PracticeInterfaceRegistry.registerSubpage({
        id: "creation",
        breadcrumb: () => [{ label: "tạo bài tập", view: "practice" }],
        route: ({ skill }) => `#/practice/${encodeURIComponent(skill || "Foundation")}/create`,
        title: ({ skillLabel }) => skillLabel ? `Tạo bài tập - ${skillLabel}` : "Tạo bài tập"
    });

    PracticeInterfaceRegistry.registerSubpage({
        id: "runner",
        breadcrumb: ({ exercise }) => exercise ? [{ label: exercise.title, view: "practice", exerciseId: exercise.id }] : [],
        route: ({ skill, exercise }) => exercise
            ? `#/practice/${encodeURIComponent(skill || "Foundation")}/exercise/${encodeURIComponent(exercise.id)}`
            : `#/practice/${encodeURIComponent(skill || "Foundation")}`,
        title: ({ exercise }) => exercise?.title || "Làm bài"
    });

    PracticeInterfaceRegistry.registerSubpage({
        id: "review",
        breadcrumb: ({ exercise }) => exercise ? [{ label: exercise.title, view: "practice", exerciseId: exercise.id }, { label: "review", view: "practice", reviewExerciseId: exercise.id }] : [{ label: "review", view: "practice" }],
        route: ({ skill, exercise }) => exercise
            ? `#/practice/${encodeURIComponent(skill || "Foundation")}/exercise/${encodeURIComponent(exercise.id)}/review`
            : `#/practice/${encodeURIComponent(skill || "Foundation")}`,
        title: ({ exercise }) => exercise?.title ? `Review - ${exercise.title}` : "Review bài tập"
    });
})();
