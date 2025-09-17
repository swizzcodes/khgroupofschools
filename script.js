// Slideshow Logic
const currentHeroLine = document.getElementById("current_hero_line");
const indicators = document.querySelectorAll(".slider_dot");
const objectives = [
    "Impacting value-based education<br>with special emphasis on<br>ethics and morals",
    "Equipping students with knowledge and<br>skills to face life's challenges",
    "Training young minds<br>to be thinkers and leaders of society",
];
const slideUrls = [
    "Drawables/background1.jpeg",
    "Drawables/background2.jpeg",
    "Drawables/background3.jpeg",
];
const slidePic = document.getElementById("slide_image");

let currentSlideIndex = 0;
let interval;

function updateSlide(index) {
    currentSlideIndex = index % objectives.length; // Ensure index stays within bounds
    if (currentHeroLine && slidePic) {
        currentHeroLine.innerHTML = objectives[currentSlideIndex];
        slidePic.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${slideUrls[currentSlideIndex]})`;
        indicators.forEach((el, i) => {
            el.style.backgroundColor = i === currentSlideIndex ? "darkgrey" : "white";
        });
    }
}

// Initialize slideshow
function initSlideshow() {
    if (slidePic) {
        updateSlide(currentSlideIndex);
        interval = setInterval(() => {
            updateSlide((currentSlideIndex + 1) % objectives.length);
        }, 3000);
    }
}

// Clear interval on manual interaction
indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
        clearInterval(interval); // Prevent conflicts with auto-slide
        updateSlide(index);
        interval = setInterval(() => {
            updateSlide((currentSlideIndex + 1) % objectives.length);
        }, 3000); // Restart interval
    });
});

// Scroll functions
function scrollToHome() {
    const view = document.getElementById("slide_image");
    view.scrollIntoView({ behavior: "smooth", block: "center" });
}

function scrollToCirculars() {
    const view = document.getElementById("bulletin_board");
    view.scrollIntoView({ behavior: "smooth", block: "center" })
}
function scrollToStrategicStatements() {
    const view = document.getElementById("school_statements_body");
    view.scrollIntoView({ behavior: "smooth", block: "start" });
}
function scrollToContactUs() {
    const view = document.getElementById("bottom_section");
    view.scrollIntoView({ behavior: "smooth", block: "start" });
}
function scrollToHistory() {
    const view = document.getElementById("historyGroup");
    view.scrollIntoView({ behavior: "smooth", block: "center" });
}

function checkActions() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");

    if (action === "scrollToHistory") {
        scrollToHistory();
    } else if (action === "scrollToContactUs") {
        scrollToContactUs();
    } else if (action === "scrollToStrategicStatements") {
        scrollToStrategicStatements();
    } else if (action == "scrollToNotices") {
        scrollToCirculars();
    }
}

// AngularJS Classroom Module
const app = angular.module("classrooms", []);

app.controller("classrooms_controller", function ($scope) {
    $scope.currentLog = "";
    $scope.girlsSchool = {};
    $scope.boysSchool = {};

    $scope.loginAdmin = function () {
        const adminId = document.getElementById("admin_id")?.value?.trim();
        const adminPassword = document.getElementById("admin_password")?.value?.trim();

        if (!adminId || !adminPassword) {
            $scope.currentLog = "Please enter both Admin ID and Password.";
            return;
        }

        fetch(`/loginAdmin?admin_id=${encodeURIComponent(adminId)}&admin_password=${encodeURIComponent(adminPassword)}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 400) {
                        $scope.$apply(() => {
                            $scope.currentLog = "The entered password is wrong.";
                        });
                    } else {
                        $scope.$apply(() => {
                            $scope.currentLog = `Unexpected error: ${response.status}`;
                        });
                    }
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data?.login_attempt === "success") {
                    const currentLog = document.getElementById("currentLog");
                    const currentLogImg = document.getElementById("currentLogImg");
                    if (currentLog && currentLogImg) {
                        currentLog.style.color = "limegreen";
                        currentLogImg.src = "Drawables/success.png";
                    }
                    sessionStorage.setItem("admin_id", data.admin_id);
                    window.location.href = "admin.html";
                } else if (data?.login_attempt === "failed") {
                    $scope.$apply(() => {
                        $scope.currentLog = "The entered password is wrong.";
                    });
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                $scope.$apply(() => {
                    $scope.currentLog = "An unexpected error occurred.";
                });
            });
    };

    fetch("/get_school_data?school_id=KHGIRLS")
        .then(response => response.json())
        .then(data => {
            $scope.$applyAsync(() => {
                $scope.girlsSchool = data;
            });
        })
        .catch(error => {
            console.error("Fetch error:", error);
            $scope.$applyAsync(() => {
                $scope.errorMessage = "Failed to load girls school data.";
            });
        });

    fetch("/get_school_data?school_id=KHBOYS")
        .then(response => response.json())
        .then(data => {
            $scope.$applyAsync(() => {
                $scope.boysSchool = data;
            });
        })
        .catch(error => {
            console.error("Fetch error:", error);
            $scope.$applyAsync(() => {
                $scope.errorMessage = "Failed to load boys school data.";
            });
        });
    const wish = localStorage.getItem("current_wish") || "Classrooms"; // Default to 'classrooms'
    fetch("/album?category=" + wish)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json(); // return parsed JSON
        })
        .then(data => {
            $scope.$apply(function () {
                $scope.classPictures = data;
                console.log($scope.pictures);
            }); // data is your parsed JSON
        })
        .catch(error => {
            console.error("Fetch error:", error);
        });

   

});

// Location Setting
function setLocation(location, pageLocation) {
    if (location && pageLocation) {
        localStorage.setItem("current_wish", location);
        window.location.href = pageLocation;
    }
}

// Clean URL on load
window.addEventListener("load", () => {
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, url);
    checkActions();
    initSlideshow();
});

// Admin Login UI
function showAdminBox() {
    const homeOwner = document.getElementById("home_owner");
    const adminLogin = document.getElementById("admin_login_section");
        homeOwner.style.filter = "blur(10px)";
        adminLogin.style.display = "flex";
    
}

function closeAdminBox() {
    const homeOwner = document.getElementById("home_owner");
    const adminLogin = document.getElementById("admin_login_section");
    if (homeOwner && adminLogin) {
        adminLogin.style.display = "none";
        homeOwner.style.filter = "blur(0px)";
    }
}

// AngularJS Admin Module
const admin = angular.module("admin", []);

admin.controller("admin_controller", function ($scope) {
    $scope.admin_id = sessionStorage.getItem("admin_id");
    $scope.currentAdminData = {};
    $scope.girlsSchool = {};
    $scope.boysSchool = {};

    $scope.deleteImage = function (path) {
        fetch(`/delete-image?path=${encodeURIComponent(path)}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                fetch("/album?category=" + document.getElementById("platform_selector").value)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        return response.json(); // return parsed JSON
                    })
                    .then(data => {
                        $scope.$apply(function () {
                            $scope.currentPictureSet = data;
                        });
                    })
                    .catch(error => {
                        console.error("Fetch error:", error);
                    });
            })
            .catch(err => console.error("Delete error:", err));
    };


    $scope.platform_changed = function () {
        const platform = document.getElementById("platform_selector").value;

            fetch("/album?category=" + platform)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json(); // return parsed JSON
                })
                .then(data => {
                    $scope.$apply(function () {
                        $scope.currentPictureSet = data;
                    }); // data is your parsed JSON
                })
                .catch(error => {
                    console.error("Fetch error:", error);
                })
        
    }

    $scope.initNotices = function () {
        fetch(`/login_admin_now?admin_id=${encodeURIComponent($scope.admin_id)}`)
            .then(response => response.json())
            .then(data => {
                $scope.$applyAsync(() => {
                    $scope.currentAdminData = data;
                });
            })
            .catch(error => {
                console.error("Fetch error:", error);
                $scope.$applyAsync(() => {
                    $scope.errorMessage = "Failed to load admin data.";
                });
            });

        fetch("/get_school_data?school_id=KHGIRLS")
            .then(response => response.json())
            .then(data => {
                $scope.$applyAsync(() => {
                    $scope.girlsSchool = data;
                });
            })
            .catch(error => {
                console.error("Fetch error:", error);
                $scope.$applyAsync(() => {
                    $scope.errorMessage = "Failed to load girls school data.";
                });
            });

        fetch("/get_school_data?school_id=KHBOYS")
            .then(response => response.json())
            .then(data => {
                $scope.$applyAsync(() => {
                    $scope.boysSchool = data;
                });
            })
            .catch(error => {
                console.error("Fetch error:", error);
                $scope.$applyAsync(() => {
                    $scope.errorMessage = "Failed to load boys school data.";
                });
            });
    };

    $scope.convertToAmPm = function (railwayTime) {
        if (!railwayTime || typeof railwayTime !== "string" || !railwayTime.includes(":")) return "";
        const [hourStr, minuteStr] = railwayTime.split(":");
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        if (isNaN(hour) || isNaN(minute)) return "";
        const ampm = hour >= 12 ? "PM" : "AM";
        const adjustedHour = hour % 12 || 12;
        return `${adjustedHour}:${minute < 10 ? "0" + minute : minute} ${ampm}`;
    };

    $scope.change_status = function (index, school) {
        const circularsArray = school === "KHGIRLS" ? $scope.girlsSchool.school_circulars : $scope.boysSchool.school_circulars;
        if (!circularsArray || !circularsArray[index]) return;

        const currentState = circularsArray[index].notice_status;
        const newState = !currentState;

        fetch(`/update_status?index=${index}&notice_status=${newState}&school_id=${school}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    $scope.$applyAsync(() => {
                        circularsArray[index].notice_status = newState;
                    });
                } else {
                    $scope.$applyAsync(() => {
                        $scope.errorMessage = "Failed to update notice status.";
                    });
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                $scope.$applyAsync(() => {
                    $scope.errorMessage = "Failed to update notice status.";
                });
            });
    };

    $scope.delete_notice = function (index, school) {
        fetch(`/delete_notice?index=${index}&school_id=${school}`, { method: "DELETE" })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    $scope.$applyAsync(() => {
                        const circularsArray = school === "KHGIRLS" ? $scope.girlsSchool.school_circulars : $scope.boysSchool.school_circulars;
                        circularsArray.splice(index, 1);
                    });
                } else {
                    $scope.$applyAsync(() => {
                        $scope.errorMessage = "Failed to delete notice.";
                    });
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                $scope.$applyAsync(() => {
                    $scope.errorMessage = "Failed to delete notice.";
                });
            });
    };

    $scope.addNotice = function () {
        const schoolId = sessionStorage.getItem("_temp_notice");
        const noticeContent = document.getElementById("current_notice")?.value?.trim();
        if (!schoolId || !noticeContent) {
            $scope.errorMessage = "Please provide a valid notice and school ID.";
            return;
        }

        const now = new Date();
        const date = now.toLocaleDateString("en-GB").split("/").join("-");
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const noticeData = {
            notice_content: noticeContent,
            notice_issued_on_date: date,
            notice_issued_on_time: `${hours}:${minutes}`,
            notice_status: true,
        };

        fetch(`/add_notice?school_id=${schoolId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(noticeData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    closeNoticeBox();
                    $scope.initNotices();
                    $scope.$applyAsync(() => {
                        $scope.errorMessage = "";
                        $scope.successMessage = "Notice added successfully.";
                    });
                } else {
                    $scope.$applyAsync(() => {
                        $scope.errorMessage = data.message || "Failed to add notice.";
                    });
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                $scope.$applyAsync(() => {
                    $scope.errorMessage = "Failed to add notice.";
                });
            });
    };

    $scope.initNotices();
});

// Admin Notice Maker
function showGirlsNoticeMaker(schoolId) {
    if (schoolId) {
        document.getElementById("current_notice").value = "";
        sessionStorage.setItem("_temp_notice", schoolId);
        const adminOwner = document.getElementById("admin_owner");
        const noticeMaker = document.getElementById("notice_maker_box");
        if (adminOwner && noticeMaker) {
            adminOwner.style.filter = "blur(10px)";
            noticeMaker.style.display = "flex";
        }
    }
}

function closeNoticeBox() {
    const adminOwner = document.getElementById("admin_owner");
    const noticeMaker = document.getElementById("notice_maker_box");
    if (adminOwner && noticeMaker) {
        noticeMaker.style.display = "none";
        adminOwner.style.filter = "blur(0px)";
    }
}

// AngularJS Main Page Module
const main = angular.module("mainPage", []);

main.controller("mainPageController", function ($scope) {
    $scope.currentLog = "";
    $scope.girlsSchool = {};
    $scope.boysSchool = {};

    $scope.loginAdmin = function () {
        const adminId = document.getElementById("admin_id")?.value?.trim();
        const adminPassword = document.getElementById("admin_password")?.value?.trim();

        if (!adminId || !adminPassword) {
            $scope.currentLog = "Please enter both Admin ID and Password.";
            return;
        }

        fetch(`/loginAdmin?admin_id=${encodeURIComponent(adminId)}&admin_password=${encodeURIComponent(adminPassword)}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 400) {
                        $scope.$apply(() => {
                            $scope.currentLog = "The entered password is wrong.";
                        });
                    } else {
                        $scope.$apply(() => {
                            $scope.currentLog = `Unexpected error: ${response.status}`;
                        });
                    }
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data?.login_attempt === "success") {
                    const currentLog = document.getElementById("currentLog");
                    const currentLogImg = document.getElementById("currentLogImg");
                    if (currentLog && currentLogImg) {
                        currentLog.style.color = "limegreen";
                        currentLogImg.src = "Drawables/success.png";
                    }
                    sessionStorage.setItem("admin_id", data.admin_id);
                    window.location.href = "HTML/admin.html";
                } else if (data?.login_attempt === "failed") {
                    $scope.$apply(() => {
                        $scope.currentLog = "The entered password is wrong.";
                    });
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                $scope.$apply(() => {
                    $scope.currentLog = "An unexpected error occurred.";
                });
            });
    };

    fetch("/get_school_data?school_id=KHGIRLS")
        .then(response => response.json())
        .then(data => {
            $scope.$applyAsync(() => {
                $scope.girlsSchool = data;
            });
        })
        .catch(error => {
            console.error("Fetch error:", error);
            $scope.$applyAsync(() => {
                $scope.errorMessage = "Failed to load girls school data.";
            });
        });

    fetch("/get_school_data?school_id=KHBOYS")
        .then(response => response.json())
        .then(data => {
            $scope.$applyAsync(() => {
                $scope.boysSchool = data;
            });
        })
        .catch(error => {
            console.error("Fetch error:", error);
            $scope.$applyAsync(() => {
                $scope.errorMessage = "Failed to load boys school data.";
            });
        });

    $scope.getDateInfo = function (inputDate, request) {
        if (!inputDate || !request) return null;
        const parts = inputDate.split("-");
        if (parts.length !== 3) return null;

        const day = parts[0];
        const month = parseInt(parts[1], 10) - 1;
        const year = parts[2];
        const dateObj = new Date(year, month, day);
        if (isNaN(dateObj.getTime())) return null;

        switch (request.toLowerCase()) {
            case "day":
                return day;
            case "month":
                return [
                    "JANUARY",
                    "FEBRUARY",
                    "MARCH",
                    "APRIL",
                    "MAY",
                    "JUNE",
                    "JULY",
                    "AUGUST",
                    "SEPTEMBER",
                    "OCTOBER",
                    "NOVEMBER",
                    "DECEMBER",
                ][month];
            case "year":
                return dateObj.getFullYear();
            default:
                return null;
        }
    };

    $scope.countElementsInDiv = function (divId) {
        const div = document.getElementById(divId);
        return div ? div.children.length : 0;
    };
});