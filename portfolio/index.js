const DEFAULT_LANG = "en";
const SUPPORTED_LANGS = ["en", "vi"];

const storageKey = "portfolio-lang";

const normalizeLang = (lang) => {
	if (!lang) return DEFAULT_LANG;
	const lower = lang.toLowerCase();
	if (SUPPORTED_LANGS.includes(lower)) return lower;
	if (lower.startsWith("vi")) return "vi";
	return DEFAULT_LANG;
};

const setHtmlLang = (lang) => {
	document.documentElement.setAttribute("lang", lang);
};

const renderList = (el, items) => {
	if (!Array.isArray(items)) return;
	el.innerHTML = "";
	items.forEach((item) => {
		const li = document.createElement("li");
		li.textContent = item;
		el.appendChild(li);
	});
};

const renderEducationList = (el, items) => {
	if (!Array.isArray(items)) return;
	el.innerHTML = "";
	items.forEach((item) => {
		if (!item || typeof item !== "object") return;
		const card = document.createElement("article");
		card.className = "education-item";

		const top = document.createElement("div");
		top.className = "education-top";

		const school = document.createElement("div");
		school.className = "education-school";
		school.textContent = item.school || "";

		const badge = document.createElement("span");
		badge.className = "education-badge";
		badge.textContent = item.status || "";

		const period = document.createElement("span");
		period.className = "education-period";
		period.textContent = item.period || "";
		top.appendChild(school);

		const major = document.createElement("div");
		major.className = "education-major";
		major.textContent = item.major || "";

		const bottom = document.createElement("div");
		bottom.className = "education-bottom";
		bottom.appendChild(major);
		bottom.appendChild(period);

		card.appendChild(top);
		top.appendChild(badge);
		card.appendChild(bottom);
		el.appendChild(card);
	});
};

const resolveCertificateImagePath = (imageName) => {
	if (!imageName) return "";
	if (imageName.includes("/") || imageName.startsWith("http")) {
		return imageName;
	}
	return `certificates/images/${imageName}`;
};

const renderResumeCertificates = (el, certificates) => {
	if (!Array.isArray(certificates)) return;
	el.innerHTML = "";
	certificates
		.filter((certificate) => {
			if (!certificate || typeof certificate !== "object") return false;
			const showOnResume = certificate.addRessume ?? certificate.addResume;
			return Boolean(showOnResume);
		})
		.forEach((certificate) => {
			const li = document.createElement("li");
			const link = document.createElement("a");
			link.href = certificate.certificateLink || "#";
			link.target = "_blank";
			link.rel = "noopener";
			link.className = "more-link";
			link.textContent = certificate.certificateName || "";
			li.appendChild(link);
			el.appendChild(li);
		});
};

const renderCertificateGroups = (el, certificates) => {
	if (!Array.isArray(certificates)) return;
	el.innerHTML = "";
	const groups = new Map();
	certificates.forEach((certificate) => {
		if (!certificate || typeof certificate !== "object") return;
		const groupName = certificate.groupName || "Others";
		if (!groups.has(groupName)) {
			groups.set(groupName, []);
		}
		groups.get(groupName).push(certificate);
	});

	groups.forEach((items, groupName) => {
		const group = document.createElement("div");
		group.className = "cert-group";

		const heading = document.createElement("h4");
		heading.textContent = groupName;
		group.appendChild(heading);

		items.forEach((certificate) => {
			const card = document.createElement("details");
			card.className = "course-card";

			const summary = document.createElement("summary");

			const name = document.createElement("span");
			name.className = "course-name";
			name.textContent = certificate.certificateName || "";
			summary.appendChild(name);

			const badges = document.createElement("span");
			badges.className = "course-badges";
			if (Array.isArray(certificate.badges)) {
				certificate.badges.forEach((badge) => {
					const chip = document.createElement("span");
					chip.className = "chip";
					chip.textContent = badge;
					badges.appendChild(chip);
				});
			}
			summary.appendChild(badges);

			const detail = document.createElement("div");
			detail.className = "course-detail";

			const hasCourses = Array.isArray(certificate.courses) && certificate.courses.length > 0;
			if (hasCourses) {
				detail.classList.add("course-detail--with-courses");
			}

			const certificateFile = document.createElement("div");
			certificateFile.className = "certificate-file";
			if (!hasCourses) {
				certificateFile.classList.add("certificate-file--no-courses");
			}
			if (certificate.certificateLink) {
				const certLink = document.createElement("a");
				certLink.href = certificate.certificateLink;
				certLink.target = "_blank";
				certLink.rel = "noopener";
				certLink.className = "more-link";
				certLink.textContent = "View certificate";
				certificateFile.appendChild(certLink);
			}

			if (certificate.certificateImage) {
				const imageWrap = document.createElement("div");
				imageWrap.className = "certificate-image-wrap";

				const image = document.createElement("img");
				image.className = "certificate-image";
				image.loading = "lazy";
				image.alt = certificate.certificateName || "Certificate image";
				image.src = resolveCertificateImagePath(certificate.certificateImage);
				image.addEventListener("error", () => {
					imageWrap.remove();
				});

				imageWrap.appendChild(image);
				certificateFile.appendChild(imageWrap);
			}

			detail.appendChild(certificateFile);

			if (hasCourses) {
				const courseList = document.createElement("ul");
				courseList.className = "course-sublist";
				certificate.courses.forEach((course) => {
					if (!course || typeof course !== "object") return;
					const li = document.createElement("li");
					if (course.certificateLink) {
						const link = document.createElement("a");
						link.href = course.certificateLink;
						link.target = "_blank";
						link.rel = "noopener";
						link.textContent = course.courseName || "";
						li.appendChild(link);
					} else {
						li.textContent = course.courseName || "";
					}
					courseList.appendChild(li);
				});
				detail.appendChild(courseList);
			}

			card.appendChild(summary);
			card.appendChild(detail);
			group.appendChild(card);
		});

		el.appendChild(group);
	});
};

const applyTranslations = (translations) => {
	document.querySelectorAll("[data-i18n]").forEach((el) => {
		const key = el.getAttribute("data-i18n");
		if (!key) return;
		const value = translations[key];
		if (value !== undefined) {
			el.textContent = value;
			if (el.tagName.toLowerCase() === "title") {
				document.title = value;
			}
		}
	});

	document.querySelectorAll("[data-i18n-list]").forEach((el) => {
		const key = el.getAttribute("data-i18n-list");
		if (!key) return;
		const items = translations[key];
		renderList(el, items);
	});

	document.querySelectorAll("[data-i18n-education-list]").forEach((el) => {
		const key = el.getAttribute("data-i18n-education-list");
		if (!key) return;
		const items = translations[key];
		renderEducationList(el, items);
	});
};

const applyCommon = (common) => {
	document.querySelectorAll("[data-common]").forEach((el) => {
		const key = el.getAttribute("data-common");
		if (!key) return;
		const value = common[key];
		if (value !== undefined) {
			el.textContent = value;
		}
	});

		document.querySelectorAll("[data-common-href]").forEach((el) => {
			const key = el.getAttribute("data-common-href");
			if (!key) return;
			const value = common[key];
			if (value !== undefined) {
				el.setAttribute("href", value);
			}
		});

	document.querySelectorAll("[data-common-list]").forEach((el) => {
		const key = el.getAttribute("data-common-list");
		if (!key) return;
		const items = common[key];
		renderList(el, items);
	});

	document.querySelectorAll("[data-common-education-list]").forEach((el) => {
		const key = el.getAttribute("data-common-education-list");
		if (!key) return;
		const items = common[key];
		renderEducationList(el, items);
	});

	document.querySelectorAll("[data-common-resume-certificates]").forEach((el) => {
		const key = el.getAttribute("data-common-resume-certificates");
		if (!key) return;
		const certificates = common[key];
		renderResumeCertificates(el, certificates);
	});

	document.querySelectorAll("[data-common-cert-groups]").forEach((el) => {
		const key = el.getAttribute("data-common-cert-groups");
		if (!key) return;
		const certificates = common[key];
		renderCertificateGroups(el, certificates);
	});
};

const loadIncludes = async () => {
	const targets = document.querySelectorAll("[data-include]");
	const promises = Array.from(targets).map(async (el) => {
		const file = el.getAttribute("data-include");
		if (!file) return;
		if (window.location.protocol === "file:") {
			const inline = inlineIncludes[file];
			if (inline) {
				el.innerHTML = inline;
			}
			return;
		}
		const response = await fetch(file, { cache: "no-cache" });
		if (response.ok) {
			el.innerHTML = await response.text();
		}
	});
	await Promise.all(promises);
};

const inlineCommon = {
	name: "Tran Phu Phat",
	headline: "Backend Engineer focused on Data & AI Systems",
	pageTitle: "Phat Tran | Backend Developer",
	sidebarNavTitle: "Sections",
	navResume: "Resume",
	navProjects: "Projects",
	navCertificates: "Certificates",
	contactTitle: "Contact",
	contactEmailLabel: "Email",
	contactLocationLabel: "Location",
	contactAvailabilityLabel: "Availability",
	contactAvailabilityValue: "Available for work in Da Nang, Ho Chi Minh",
	educationTitle: "Education",
	educationItems: [
		{
			school: "FPT School of Business & Technology",
			major: "Master Software in AI",
			period: "2024–present",
			status: "Studying",
		},
		{
			school: "FPT University",
			major: "Software Engineering",
			period: "2023",
			status: "Graduated",
		},
	],
	certificatesTitle: "Certificates",
	certificates: [
		{
			certificateName: "Databricks Data Engineer Professional Certificate",
			groupName: "Data Engineering",
			badges: ["Databricks", "Data Engineering"],
			addRessume: true,
			certificateLink:
				"https://credentials.databricks.com/6bced44e-c21d-496b-82a4-b5e524ead3cb#acc.8FhWCZjG",
			certificateImage: "databricks-data-engineer-professional-certificate.png",
			courses: [],
		},
		{
			certificateName: "IBM Data Architecture Professional Certificate",
			groupName: "Data Engineering",
			badges: ["IBM", "Data Architecture"],
			addRessume: true,
			certificateLink: "certificates/ibm-data-architecture-professional-certificate.pdf",
			certificateImage: "ibm-data-architecture-professional-certificate.png",
			courses: [
				{
					courseName: "Introduction to Data Engineering",
					certificateLink: "certificates/courses/introduction-to-data-engineering.pdf",
				},
				{
					courseName: "Introduction to Relational Databases (RDBMS)",
					certificateLink:
						"certificates/courses/introduction-to-relational-databases-rdbms.pdf",
				},
				{
					courseName: "SQL: A Practical Introduction for Querying Databases",
					certificateLink:
						"certificates/courses/sql-a-practical-introduction-for-querying-databases.pdf",
				},
				{
					courseName: "Hands-on Introduction to Linux Commands and Shell Scripting",
					certificateLink:
						"certificates/courses/hands-on-introduction-to-linux-commands-and-shell-scripting.pdf",
				},
				{
					courseName: "Relational Database Administration (DBA)",
					certificateLink:
						"certificates/courses/relational-database-administration-dba.pdf",
				},
				{
					courseName: "Data Warehouse Fundamentals",
					certificateLink: "certificates/courses/data-warehouse-fundamentals.pdf",
				},
				{
					courseName: "Introduction to NoSQL Databases",
					certificateLink: "certificates/courses/introduction-to-nosql-databases.pdf",
				},
				{
					courseName: "ETL and Data Pipelines with Shell, Airflow and Kafka",
					certificateLink:
						"certificates/courses/etl-and-data-pipelines-with-shell-airflow-and-kafka.pdf",
				},
				{
					courseName: "Introduction to Big Data with Spark and Hadoop",
					certificateLink:
						"certificates/courses/introduction-to-big-data-with-spark-and-hadoop.pdf",
				},
				{
					courseName: "Data Integration, Data Storage, & Data Migration",
					certificateLink:
						"certificates/courses/data-integration-data-storage-and-data-migration.pdf",
				},
				{
					courseName: "Data Privacy, Security, Governance, Risk and Compliance",
					certificateLink:
						"certificates/courses/data-privacy-security-governance-risk-and-compliance.pdf",
				},
				{
					courseName: "Enterprise Data Architecture and Operations",
					certificateLink:
						"certificates/courses/enterprise-data-architecture-and-operations.pdf",
				},
				{
					courseName: "Data Architect Capstone Project",
					certificateLink:
						"certificates/courses/data-architect-capstone-project.pdf",
				},
			],
		},
		{
			certificateName: "Agile Meets Design Thinking",
			groupName: "Soft Skills",
			badges: ["Agile", "Design Thinking"],
			addRessume: true,
			certificateLink: "certificates/agile-meets-design-thinking.pdf",
			certificateImage: "agile-meets-design-thinking.jpg",
			courses: [
				{
					courseName: "Agile Project Planning",
					certificateLink: "certificates/courses/agile-project-planning.pdf",
				},
				{
					courseName: "Design Thinking Foundations",
					certificateLink: "certificates/courses/design-thinking-foundations.pdf",
				},
			],
		},
	],
	certificatesMore: "See more",
	skillsTitle: "Technical Skills",
	skills: ["C# / ASP.NET Core", "REST API Design", "SQL Server", "Docker", "Git"],
	cvUrl: "assets/cv.pdf",
	mailUrl: "mailto:phattp1912@gmail.com",
	email: "phattp1912@gmail.com",
	location: "Thanh Khe, Da Nang, Viet Nam",
	githubUrl: "https://github.com/your-handle",
	linkedinUrl: "https://www.linkedin.com/in/your-handle",
};

const loadCommon = async () => {
	if (window.location.protocol === "file:") {
		return inlineCommon;
	}
	const response = await fetch("common.json", { cache: "no-cache" });
	if (!response.ok) {
		throw new Error("Unable to load common data");
	}
	return response.json();
};

const inlineIncludes = {
	"sidebar.html": `
		<div class="sidebar-inner">
			<div class="sidebar-profile">
				<div class="sidebar-name" data-common="name"></div>
				<div class="sidebar-role" data-common="headline"></div>
				<a class="cv-download" data-common-href="cvUrl" target="_blank" rel="noopener">Download CV</a>
				<div class="sidebar-divider" aria-hidden="true"></div>
			</div>
			<div class="sidebar-section">
				<div class="sidebar-title" data-common="sidebarNavTitle"></div>
				<ul class="sidebar-nav">
					<li><a href="index.html" data-common="navResume"></a></li>
					<li><a href="projects.html" data-common="navProjects"></a></li>
					<li><a href="certificates.html" data-common="navCertificates"></a></li>
				</ul>
			</div>
			<div class="sidebar-social">
				<a class="icon-link" data-common-href="mailUrl" aria-label="Email" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.75a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6.75v10.5A2.25 2.25 0 0 1 18.75 19.5H5.25A2.25 2.25 0 0 1 3 17.25V6.75Zm2.25-.75a.75.75 0 0 0-.75.75v.217l7.5 4.688 7.5-4.688V6.75a.75.75 0 0 0-.75-.75H5.25Zm14.25 3.164-6.932 4.332a1.5 1.5 0 0 1-1.568 0L4.5 9.164v8.086c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75V9.164Z" /></svg></a>
				<a class="icon-link" data-common-href="githubUrl" aria-label="GitHub" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.63 22.41c.58.1.8-.25.8-.57v-2.1c-3.26.73-3.95-1.4-3.95-1.4-.54-1.34-1.33-1.7-1.33-1.7-1.09-.72.08-.7.08-.7 1.2.08 1.83 1.2 1.83 1.2 1.07 1.78 2.8 1.26 3.48.96.1-.75.42-1.26.76-1.55-2.6-.28-5.34-1.26-5.34-5.62 0-1.25.47-2.28 1.23-3.08-.13-.3-.53-1.55.12-3.23 0 0 1-.31 3.3 1.18a11.4 11.4 0 0 1 6 0c2.3-1.49 3.29-1.18 3.29-1.18.65 1.68.25 2.93.12 3.23.76.8 1.22 1.83 1.22 3.08 0 4.37-2.74 5.34-5.36 5.62.43.37.82 1.1.82 2.22v3.3c0 .32.21.68.8.57A11.5 11.5 0 0 0 12 .5Z" /></svg></a>
				<a class="icon-link" data-common-href="linkedinUrl" aria-label="LinkedIn" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 3.75H4.5A.75.75 0 0 0 3.75 4.5v15a.75.75 0 0 0 .75.75h15a.75.75 0 0 0 .75-.75v-15a.75.75 0 0 0-.75-.75ZM8.25 18H6v-7.5h2.25V18Zm-1.125-8.625a1.312 1.312 0 1 1 0-2.625 1.312 1.312 0 0 1 0 2.625ZM18 18h-2.25v-4.125c0-.986-.018-2.25-1.375-2.25-1.375 0-1.586 1.074-1.586 2.18V18H10.5v-7.5h2.16v1.023h.03c.3-.57 1.03-1.17 2.12-1.17 2.27 0 2.69 1.495 2.69 3.438V18Z" /></svg></a>
			</div>
		</div>
	`,
};

const inlineTranslations = {
	en: {
		aboutTitle: "About Me",
		aboutBody:
			"Backend developer passionate about clean architecture, scalable APIs, and data pipeline systems. Strong foundation in multi-layer architecture and validation logic.",
		projectsTitle: "Projects",
		projectsMore: "See more",
		project1Title: "Access Management API",
		project1Body:
			"Enterprise-level API with validation, rate limiting and Swagger documentation.",
		project2Title: "Streaming Data Pipeline",
		project2Body:
			"Designed large-scale streaming pipeline following Medallion architecture concept.",
		footer: "© 2026 Phat Tran",
	},
	vi: {
		aboutTitle: "Giới thiệu",
		aboutBody:
			"Lập trình viên backend yêu thích kiến trúc sạch, API mở rộng và hệ thống pipeline dữ liệu. Nền tảng vững về kiến trúc nhiều tầng và logic kiểm tra dữ liệu.",
		projectsTitle: "Dự án",
		projectsMore: "Xem thêm",
		project1Title: "Access Management API",
		project1Body:
			"API cấp doanh nghiệp với kiểm tra dữ liệu, giới hạn tần suất và tài liệu Swagger.",
		project2Title: "Streaming Data Pipeline",
		project2Body: "Thiết kế pipeline streaming quy mô lớn theo kiến trúc Medallion.",
		footer: "© 2026 Phat Tran",
	},
};

const loadTranslations = async (lang) => {
	if (window.location.protocol === "file:") {
		const inline = inlineTranslations[lang];
		if (!inline) throw new Error("Missing inline translations");
		return inline;
	}
	const response = await fetch(`locales/${lang}.json`, { cache: "no-cache" });
	if (!response.ok) {
		throw new Error("Unable to load translations");
	}
	return response.json();
};

const updateLanguage = async (lang) => {
	const normalized = normalizeLang(lang);
	try {
		const translations = await loadTranslations(normalized);
		applyTranslations(translations);
		setHtmlLang(normalized);
		localStorage.setItem(storageKey, normalized);
	} catch (error) {
		if (normalized !== DEFAULT_LANG) {
			const fallback = await loadTranslations(DEFAULT_LANG);
			applyTranslations(fallback);
			setHtmlLang(DEFAULT_LANG);
			localStorage.setItem(storageKey, DEFAULT_LANG);
		}
	}
};

const init = async () => {
	await loadIncludes();
	const common = await loadCommon();
	applyCommon(common);
	const select = document.getElementById("lang-switch");
	const initial = DEFAULT_LANG;
	localStorage.setItem(storageKey, initial);
	if (select) {
		select.checked = initial === "en";
		select.addEventListener("change", (event) => {
			updateLanguage(event.target.checked ? "en" : "vi");
		});
	}
	updateLanguage(initial);
};

document.addEventListener("DOMContentLoaded", () => {
	init();
});
