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
		if (!Array.isArray(items)) return;
		el.innerHTML = "";
		items.forEach((item) => {
			const li = document.createElement("li");
			li.textContent = item;
			el.appendChild(li);
		});
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
	sidebarNavTitle: "Sections",
	navResume: "Resume",
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
			</div>
			<div class="sidebar-section">
				<div class="sidebar-title" data-common="sidebarNavTitle"></div>
				<ul class="sidebar-nav">
					<li><a href="index.html" data-common="navResume"></a></li>
				</ul>
			</div>
		</div>
	`,
};

const inlineTranslations = {
	en: {
		pageTitle: "Phat Tran | Backend Developer",
		aboutTitle: "About Me",
		aboutBody:
			"Backend developer passionate about clean architecture, scalable APIs, and data pipeline systems. Strong foundation in multi-layer architecture and validation logic.",
		contactTitle: "Contact",
		contactEmailLabel: "Email",
		contactLocationLabel: "Location",
		contactAvailabilityLabel: "Availability",
		contactAvailabilityValue: "Available for work in Da Nang, Ho Chi Minh",
		educationTitle: "Education",
		educationItems: ["B.Sc. in Information Technology — Your University (2021–2025)"],
		certificatesTitle: "Certificates",
		certificatesItems: ["Azure Fundamentals (AZ-900)", "SQL for Data Engineering"],
		skillsTitle: "Technical Skills",
		skills: ["C# / ASP.NET Core", "REST API Design", "SQL Server", "Docker", "Git"],
		projectsTitle: "Projects",
		project1Title: "Access Management API",
		project1Body:
			"Enterprise-level API with validation, rate limiting and Swagger documentation.",
		project2Title: "Streaming Data Pipeline",
		project2Body:
			"Designed large-scale streaming pipeline following Medallion architecture concept.",
		footer: "© 2026 Phat Tran",
	},
	vi: {
		pageTitle: "Phat Tran | Lập trình viên Backend",
		aboutTitle: "Giới thiệu",
		aboutBody:
			"Lập trình viên backend yêu thích kiến trúc sạch, API mở rộng và hệ thống pipeline dữ liệu. Nền tảng vững về kiến trúc nhiều tầng và logic kiểm tra dữ liệu.",
		contactTitle: "Liên hệ",
		contactEmailLabel: "Email",
		contactLocationLabel: "Địa điểm",
		contactAvailabilityLabel: "Sẵn sàng",
		contactAvailabilityValue: "Có thể làm việc tại Đà Nẵng, TP. Hồ Chí Minh",
		educationTitle: "Học vấn",
		educationItems: ["Cử nhân Công nghệ Thông tin — Trường Đại học (2021–2025)"],
		certificatesTitle: "Chứng chỉ",
		certificatesItems: ["Azure Fundamentals (AZ-900)", "SQL cho Data Engineering"],
		skillsTitle: "Kỹ năng kỹ thuật",
		skills: ["C# / ASP.NET Core", "Thiết kế REST API", "SQL Server", "Docker", "Git"],
		projectsTitle: "Dự án",
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
