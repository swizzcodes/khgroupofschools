const currentHeroLine = document.getElementById("current_hero_line");
const indicators = document.querySelectorAll('.slider_dot');
const objectives = [
  "Impacting value based education <br> with special emphasis on<br> ethics and morals",
  "Equipping students with knowledge and <br>skills to face the challenges in life",
  "Training young minds<br> to be thinkers and leaders of the society"
];

const slideUrls = [
  "Drawables/background1.jpeg",
  "Drawables/background2.jpeg",
  "Drawables/background3.jpeg"
];
const slidePic = document.getElementById('slide_image');

let currentSlideIndex = 0;
let interval;

// reusable update function
function updateSlide(index) {
    currentSlideIndex = index;
    if (currentHeroLine) {
        currentHeroLine.innerHTML = objectives[currentSlideIndex];

        // Apply both gradient and image correctly
        slidePic.style.backgroundImage = `
  linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
  url(${slideUrls[currentSlideIndex]})
`;


        indicators.forEach((el, i) => {
            el.style.backgroundColor = (i === currentSlideIndex) ? "darkgrey" : "white";
        });
    }
}

// initial load
if (slidePic) {
  updateSlide(currentSlideIndex);
}

// auto slide
interval = setInterval(() => {
  const next = (currentSlideIndex + 1) % objectives.length;
  updateSlide(next);
}, 3000);

// click handlers
indicators.forEach((indicator, index) => {
  indicator.addEventListener('click', () => {
    updateSlide(index);
  });
});

function scrollToHome() {
  const view = document.getElementById("slide_image");
  view.scrollIntoView({ behavior: "smooth", block: "center" });
}

function scrollToCirculars() {
    const view = document.getElementById("bulletin_board");
    view.scrollIntoView({ behavior:"smooth",block:"center" })
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


const app = angular.module("classrooms", []);

app.controller("classrooms_controller", function($scope) {
  const wish = localStorage.getItem("current_wish");
  const picturePaths = {
    classrooms: 15,
    laboratories: 19,
    libraries: 4,
    campus: 12
  };

  $scope.classPictures = [];
  $scope.currentImageIndex = 0;
  $scope.hasPrevious = false;
  $scope.hasNext = false;

  if (picturePaths[wish]) {
    const basePath = `../Drawables/${wish.charAt(0).toUpperCase() + wish.slice(1)}`;
    $scope.classPictures = Array.from({ length: picturePaths[wish] }, (_, i) => `${basePath}/${i + 1}.jpeg`);
    }
    $scope.hideImageViewer = function() {
        document.getElementById("image_viewer").style.display = "none";
        document.getElementById("images_owner").style.filter = "blur(0px)";
    }

  function updateNavButtons() {
    $scope.hasPrevious = $scope.currentImageIndex > 0;
    $scope.hasNext = $scope.currentImageIndex < $scope.classPictures.length - 1;
  }

  $scope.show_image = function(source) {
    document.getElementById("image_viewer").style.display = "flex";
    document.getElementById('focused_image').src = source;
    document.getElementById("images_owner").style.filter = "blur(10px)";
    $scope.currentImageIndex = $scope.classPictures.indexOf(source);
    updateNavButtons();
  };

  $scope.goLeft = function() {
  if ($scope.classPictures.length === 0) return;

  // Wrap to last image if at the first
  if ($scope.currentImageIndex === 0) {
    $scope.currentImageIndex = $scope.classPictures.length - 1;
  } else {
    $scope.currentImageIndex--;
  }

  document.getElementById('focused_image').src = $scope.classPictures[$scope.currentImageIndex];
  updateNavButtons();
};

$scope.goRight = function() {
  if ($scope.classPictures.length === 0) return;

  // Wrap to first image if at the last
  if ($scope.currentImageIndex === $scope.classPictures.length - 1) {
    $scope.currentImageIndex = 0;
  } else {
    $scope.currentImageIndex++;
  }

  document.getElementById('focused_image').src = $scope.classPictures[$scope.currentImageIndex];
  updateNavButtons();
};
});


function setLocation(location, pageLocation) {
  localStorage.setItem("current_wish", location);
  if (localStorage.getItem("current_wish")) {
    window.location.href = pageLocation;
  }
}

function checkActions(){
  const params = new URLSearchParams(window.location.search);
    const action = params.get("action");

    if (action === "scrollToHistory") {
        scrollToHistory();
    }else if(action === "scrollToContactUs"){
      scrollToContactUs();
    }else if(action === "scrollToStrategicStatements"){
      scrollToStrategicStatements();
    }
}
window.addEventListener("load", function () {
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, url);
});

function loginAdmin() {
    fetch("/loginAdmin?admin_id=" + document.getElementById("admin_id").value + "&admin_password=" + document.getElementById("admin_password").value)
        .then(response => response.json())
        .then(data => {
            if (data.login_attempt == "success") {
                document.getElementById("login_content").style.display = "none";
                document.getElementById("success_denoter").style.display = "block";
                sessionStorage.setItem("admin_id", data.admin_id)
                window.location.href = "HTML/admin.html"
            } else if (data.login_attempt == "failed") {
                
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
        });
}

function showAdminBox(){
  document.getElementById('home_owner').style.filter="blur(10px)";
  document.getElementById("admin_login_section").style.display="flex";
}

var admin = angular.module("admin", []);

admin.controller("admin_controller", function ($scope) {
    $scope.admin_id = sessionStorage.getItem("admin_id");
    $scope.initNotices = function () {
        fetch("/login_admin_now?admin_id=" + encodeURIComponent($scope.admin_id))
            .then(response => response.json()) // Properly return the JSON-parsed response
            .then(data => {
                $scope.$apply(function () {
                    $scope.currentAdminData = data;
                })
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });

        fetch("/get_school_data?school_id=KHGIRLS")
            .then(response => response.json())
            .then(data => {
                $scope.$apply(function () {
                    $scope.girlsSchool = data;
                });
            });
        fetch("/get_school_data?school_id=KHBOYS")
            .then(response => response.json())
            .then(data => {
                $scope.$apply(function () {
                    $scope.boysSchool = data;
                    console.log("Boys school data: ", data);
                });
            });

    }
    $scope.initNotices();
    $scope.convertToAmPm = function (railwayTime) {
        if (!railwayTime || typeof railwayTime !== "string") return "";

        const [hourStr, minuteStr] = railwayTime.split(":");
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        if (isNaN(hour) || isNaN(minute)) return "";

        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        if (hour === 0) hour = 12;

        return hour + ":" + (minute < 10 ? "0" + minute : minute) + " " + ampm;
    };
    $scope.change_status = function (index, school) {
        let circularsArray;

        if (school === 'KHGIRLS') {
            circularsArray = $scope.girlsSchool.school_circulars;
        } else if (school === 'KHBOYS') {
            circularsArray = $scope.boysSchool.school_circulars;
        } else {
            console.error("Unknown school id", school);
            return;
        }

        const currentState = circularsArray[index].notice_status;
        const newState = !currentState;

        fetch(`/update_boys_notice?index=${index}&notice_status=${newState}&school_id=${school}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    $scope.$apply(() => {
                        circularsArray[index].notice_status = newState;
                    });
                }
            })
            .catch(err => {
                console.error(err);
            });
    };
    $scope.delete_notice = function (index, school) {
        fetch(`/delete_notice?index=${index}&school_id=${school}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    $scope.$apply(() => {
                        if (school === 'KHGIRLS') {
                            $scope.girlsSchool.school_circulars.splice(index, 1);
                        } else if (school === 'KHBOYS') {
                            $scope.boysSchool.school_circulars.splice(index, 1);
                        }
                    });
                } else {
                    console.error("Failed to delete notice", data.error);
                }
            })
            .catch(err => console.error(err));
    };
    $scope.addNotice = function () {
        const schoolId = sessionStorage.getItem('_temp_notice');;
        console.log(schoolId)
        const now = new Date();
        const date = now.toLocaleDateString("en-GB").split("/").join("-"); // dd-mm-yyyy

        // Generate time in 24-hour format (hh:mm)
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const time = `${hours}:${minutes}`;

        const noticeData = {
            notice_content: document.getElementById("current_notice").value,
            notice_issued_on_date: date,
            notice_issued_on_time: time,
            notice_status: true
        };

        fetch(`https://localhost:8787/add_notice?school_id=${schoolId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(noticeData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    closeNoticeBox();
                    $scope.initNotices();

                    console.log("? Notice added successfully");
                } else {
                    console.error("? Failed to add notice:", data.message);
                }
            })
            .catch(error => {
                console.error("? Error while adding notice:", error);
            });


    }
});

function closeAdminBox() {
    document.getElementById("admin_login_section").style.display = "none";
    document.getElementById('home_owner').style.filter = "blur(0px)";
}

function closeNoticeBox() {
    document.getElementById("notice_maker_box").style.display = "none";
    document.getElementById("admin_owner").style.filter = "blur(0px)";
}
let currentSchoolNoticeId;
function showGirlsNoticeMaker(schoolId) {
    sessionStorage.setItem('_temp_notice', schoolId);
    document.getElementById("admin_owner").style.filter = "blur(10px)";
    document.getElementById("notice_maker_box").style.display = "flex";
}

var main = angular.module("mainPage", []);

main.controller("mainPageController", function ($scope) {
    fetch("/get_school_data?school_id=KHGIRLS")
        .then(response => response.json())
        .then(data => {
            $scope.$apply(function () {
                $scope.girlsSchool = data;
            });
        });
    fetch("/get_school_data?school_id=KHBOYS")
        .then(response => response.json())
        .then(data => {
            $scope.$apply(function () {
                $scope.boysSchool = data;
            });
        });
    $scope.getDateInfo = function (inputDate, request) {
        if (!inputDate || !request) return null;

        var parts = inputDate.split('-');
        if (parts.length !== 3) return null;

        var day = parts[0];
        var month = parseInt(parts[1], 10) - 1;
        var year = parts[2];

        // Create a valid date object
        var dateObj = new Date(year, month, day);
        if (isNaN(dateObj.getTime())) return null;

        // Handle request types
        switch (request.toLowerCase()) {
            case 'day':
                return day;
            case 'month':
                var monthNames = [
                    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
                ];
                return monthNames[month];
            case 'year':
                return dateObj.getFullYear(); // ensures 4-digit year is returned
            default:
                return null;
        }
    };

    $scope.countElementsInDiv = function (divId) {
        var div = document.getElementById(divId);
        if (div) {
            return div.children.length; // counts only element nodes
        }
        return 0; // div not found
    };
});