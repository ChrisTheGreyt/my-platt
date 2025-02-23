--
-- PostgreSQL database dump
--

-- Dumped from database version 15.9 (Homebrew)
-- Dumped by pg_dump version 15.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Attachment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Attachment" (
    id integer NOT NULL,
    "fileURL" text NOT NULL,
    "fileName" text,
    "taskId" integer NOT NULL,
    "uploadedById" integer NOT NULL
);


ALTER TABLE public."Attachment" OWNER TO postgres;

--
-- Name: Attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Attachment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Attachment_id_seq" OWNER TO postgres;

--
-- Name: Attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Attachment_id_seq" OWNED BY public."Attachment".id;


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Comment" (
    id integer NOT NULL,
    text text NOT NULL,
    "taskId" integer NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."Comment" OWNER TO postgres;

--
-- Name: Comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Comment_id_seq" OWNER TO postgres;

--
-- Name: Comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Comment_id_seq" OWNED BY public."Comment".id;


--
-- Name: Project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Project" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "applicationFee" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isSchool" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" integer DEFAULT 1
);


ALTER TABLE public."Project" OWNER TO postgres;

--
-- Name: ProjectTeam; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProjectTeam" (
    id integer NOT NULL,
    "teamId" integer NOT NULL,
    "projectId" integer NOT NULL
);


ALTER TABLE public."ProjectTeam" OWNER TO postgres;

--
-- Name: ProjectTeam_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ProjectTeam_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ProjectTeam_id_seq" OWNER TO postgres;

--
-- Name: ProjectTeam_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProjectTeam_id_seq" OWNED BY public."ProjectTeam".id;


--
-- Name: Project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Project_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Project_id_seq" OWNER TO postgres;

--
-- Name: Project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Project_id_seq" OWNED BY public."Project".id;


--
-- Name: Task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Task" (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    status text,
    priority text,
    tags text,
    "startDate" timestamp(3) without time zone,
    "dueDate" timestamp(3) without time zone,
    points integer,
    "projectId" integer NOT NULL,
    "authorUserId" integer NOT NULL,
    "assignedUserId" integer
);


ALTER TABLE public."Task" OWNER TO postgres;

--
-- Name: TaskAssignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TaskAssignment" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "taskId" integer NOT NULL
);


ALTER TABLE public."TaskAssignment" OWNER TO postgres;

--
-- Name: TaskAssignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TaskAssignment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TaskAssignment_id_seq" OWNER TO postgres;

--
-- Name: TaskAssignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TaskAssignment_id_seq" OWNED BY public."TaskAssignment".id;


--
-- Name: Task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Task_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Task_id_seq" OWNER TO postgres;

--
-- Name: Task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Task_id_seq" OWNED BY public."Task".id;


--
-- Name: Team; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Team" (
    id integer NOT NULL,
    "teamName" text NOT NULL,
    "productOwnerUserId" integer,
    "projectManagerUserId" integer
);


ALTER TABLE public."Team" OWNER TO postgres;

--
-- Name: Team_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Team_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Team_id_seq" OWNER TO postgres;

--
-- Name: Team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Team_id_seq" OWNED BY public."Team".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    "userId" integer NOT NULL,
    "cognitoId" text,
    username text NOT NULL,
    "profilePictureUrl" text,
    "teamId" integer,
    email text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "subscriptionStatus" text,
    "selectedTrack" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserTasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserTasks" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "taskId" integer NOT NULL,
    status text DEFAULT 'To Do'::text NOT NULL,
    priority text DEFAULT 'Medium'::text NOT NULL
);


ALTER TABLE public."UserTasks" OWNER TO postgres;

--
-- Name: UserTasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserTasks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserTasks_id_seq" OWNER TO postgres;

--
-- Name: UserTasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserTasks_id_seq" OWNED BY public."UserTasks".id;


--
-- Name: User_userId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_userId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_userId_seq" OWNER TO postgres;

--
-- Name: User_userId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_userId_seq" OWNED BY public."User"."userId";


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Attachment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attachment" ALTER COLUMN id SET DEFAULT nextval('public."Attachment_id_seq"'::regclass);


--
-- Name: Comment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment" ALTER COLUMN id SET DEFAULT nextval('public."Comment_id_seq"'::regclass);


--
-- Name: Project id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project" ALTER COLUMN id SET DEFAULT nextval('public."Project_id_seq"'::regclass);


--
-- Name: ProjectTeam id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectTeam" ALTER COLUMN id SET DEFAULT nextval('public."ProjectTeam_id_seq"'::regclass);


--
-- Name: Task id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task" ALTER COLUMN id SET DEFAULT nextval('public."Task_id_seq"'::regclass);


--
-- Name: TaskAssignment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment" ALTER COLUMN id SET DEFAULT nextval('public."TaskAssignment_id_seq"'::regclass);


--
-- Name: Team id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Team" ALTER COLUMN id SET DEFAULT nextval('public."Team_id_seq"'::regclass);


--
-- Name: User userId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN "userId" SET DEFAULT nextval('public."User_userId_seq"'::regclass);


--
-- Name: UserTasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserTasks" ALTER COLUMN id SET DEFAULT nextval('public."UserTasks_id_seq"'::regclass);


--
-- Data for Name: Attachment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Attachment" (id, "fileURL", "fileName", "taskId", "uploadedById") FROM stdin;
7	i7.jpg	GolfAI.pdf	7	13
8	i8.jpg	HotelDB.pdf	8	15
9	i9.jpg	TelecomUpgrade.pdf	9	17
10	i10.jpg	SecurityProtocol.pdf	101	19
1	i1.jpg	DesignDoc.pdf	1	1
2	i2.jpg	NavAlgorithm.pdf	9	3
3	i3.jpg	EnergySolutions.pdf	16	5
4	i4.jpg	SoftwareWorkflow.pdf	25	7
5	i5.jpg	AIPredictions.pdf	31	9
6	i6.jpg	BiotechTest.pdf	37	11
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Comment" (id, text, "taskId", "userId") FROM stdin;
1	We need to update this design to include new specifications.	1	2
2	Can we meet to discuss the navigation algorithm updates?	2	4
3	This energy solution looks promising, but needs more research.	3	6
4	Let's revise the software development workflow to include agile methodologies.	4	8
5	We should consider newer AI models for better accuracy.	5	10
6	Product testing needs to be more rigorous.	6	12
7	Optimization algorithms are not yet efficient.	7	14
8	Database overhaul could impact current operations negatively.	8	16
9	Infrastructure upgrades must be done during low traffic hours.	9	18
10	Security measures need to be enhanced to prevent data breaches.	10	20
11	Consider using more robust training datasets for AI.	11	1
12	Server security update meeting scheduled for next week.	12	2
13	UX redesign has been well received in initial user tests.	13	3
14	Data analytics implementation needs to account for real-time processing delays.	14	4
15	Encryption project needs to align with international security standards.	15	5
16	Review cloud storage optimization strategies in Q3 meeting.	16	6
17	Hardware compatibility tests to include newer device models.	17	7
18	Visualization tools to support both 2D and 3D data representations.	18	8
19	IoT device prototypes to undergo extensive field testing.	19	9
20	Legacy system upgrade to start with backend databases.	20	10
21	Network security framework should prioritize threat detection improvements.	21	1
22	Application deployment strategies to include Docker integration.	22	2
23	Market analysis should cover competitive product landscapes.	23	3
24	Feedback mechanisms to utilize adaptive questioning techniques.	24	4
25	API integration must ensure data privacy compliance!	25	5
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Project" (id, name, description, "startDate", "endDate", "applicationFee", "createdAt", "isSchool", "updatedAt", "userId") FROM stdin;
1	Month 1	A space exploration project.	2023-01-01 00:00:00	2023-12-31 00:00:00	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
2	Month 2	Developing advanced navigation systems.	2023-02-01 00:00:00	2023-10-15 00:00:00	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
3	Month 3	A project to boost renewable energy use.	2023-03-05 00:00:00	2024-03-05 00:00:00	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
101	Month 1	Tasks - weeks 1-5	\N	\N	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
102	Month 2	Task 6 - 11	\N	\N	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
103	Month 3	Task 12 - 18	\N	\N	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
104	Month 4	Task 18 - 25	\N	\N	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
25	Month 5	Echo project focused on AI advancements.	2023-04-15 00:00:00	2023-11-30 00:00:00	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
26	Month 6	Exploring cutting-edge biotechnology.	2023-02-25 00:00:00	2023-08-25 00:00:00	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
27	Month 7	Development of new golf equipment using AI.	2023-05-10 00:00:00	2023-12-10 00:00:00	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
28	Month 8	Hotel management system overhaul.	2023-03-01 00:00:00	2024-01-01 00:00:00	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
29	Month 9	Telecommunication infrastructure upgrade.	2023-06-01 00:00:00	2023-12-01 00:00:00	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
30	Month 10	Initiative to enhance cyber-security measures.	2023-07-01 00:00:00	2024-02-01 00:00:00	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
31	Bonus	Bonus initiatives 	\N	\N	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
4	Month 4	Delta project for new software development techniques.	2023-01-20 00:00:00	2023-09-20 00:00:00	\N	2025-01-27 21:01:27.01	f	2025-01-27 21:01:27.01	1
\.


--
-- Data for Name: ProjectTeam; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectTeam" (id, "teamId", "projectId") FROM stdin;
1	1	1
2	2	1
3	3	1
4	4	1
5	5	1
6	1	2
7	2	2
8	3	2
9	4	2
10	5	2
11	1	3
12	2	3
13	3	3
14	4	3
15	5	3
16	1	4
17	2	4
18	3	4
19	4	4
20	5	4
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Task" (id, title, description, status, priority, tags, "startDate", "dueDate", points, "projectId", "authorUserId", "assignedUserId") FROM stdin;
6	Recommendation letters	Choose recommenders based on weaknesses/strengths \nSuggestions/comments: if you cannot meet with your recommenders then you can write a one-pager to help them with writing your letter.\n	To Do	Medium	Testing	\N	2023-08-01 00:00:00	0	1	11	12
18	Task 18	Take LSAT practice test if taking January LSAT.	To Do	High	Visualization	2024-01-01 00:00:00	2024-01-31 00:00:00	\N	4	15	16
19	Task 19	Write final drafts of optional statements if not finalized in December.	To Do	High	recommendations	2023-09-01 00:00:00	2024-01-01 00:00:00	\N	4	17	18
20	Task 20	Write any additional supplemental statements within LSAC.	To Do	Medium	relationship	2023-10-10 00:00:00	2024-02-10 00:00:00	\N	4	19	20
120	Outreach	After you have completed the recommender list, reach out to them to nurture the relationship.	To Do	Medium		\N	\N	0	104	1	1
124	Prep	Start thinking about application prep, and if you are progressing at a good pace with your LSAT studying to start incorporating prep next 1-2 months. If not, increase LSAT studying.	To Do	Medium		\N	\N	0	104	1	1
119	Make recommendation list	Begin thinking about who you would like to be your recommenders. Make a list of potential candidates and what you think they would say about you.	To Do	Medium		\N	\N	0	104	1	1
122	Choose test date	Look at upcoming LSAT test dates and see which test you think you will be ready for.\nSuggestions/comments: You should only take a test when you are scoring in your goal LSAT test range on your practice tests.	Work In Progress	Medium		\N	\N	0	104	1	1
123	Meetings	Set up a meeting with one recommender, virtually or in-person. The goal is to tell them of any updates/happenings in your life to equip them with strong material for your letter.	To Do	Medium		\N	\N	0	104	1	1
1	Create study schedule	Create a schedule to figure out how much time you have to devote to LSAT and applications.\n\nResource:\n[Blank study schedule](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month1/Schedule_Template.xlsx)\n\n[LSAT study schedule video](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month1/LSAT+study+schedule.mp4)	To Do	Medium	Study Schedule, LSAT	\N	2023-04-10 00:00:00	0	1	1	30
7	Brainstorm materials	Brainstorm your material topic ideas \nResources:\n[Brainstorming worksheet](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month1/Brainstorming_Worksheet.docx)\n	Work In Progress	High	Brainstorming	\N	2023-11-15 00:00:00	0	1	13	14
121	Take practice test	Take an LSAT practice test	To Do	Medium		\N	\N	0	104	1	1
118	LSAT study	Continue studying for at least 5 hours per week.	Work In Progress	Medium		\N	\N	0	104	1	1
13	Task 13	 Start writing first drafts of main application materials.	Work In Progress	Urgent	Design, UX	2023-03-15 00:00:00	2023-07-15 00:00:00	\N	3	5	6
16	Task 16	Reach out to recommenders and ensure their letters are in.	To Do	Backlog	Cloud, Storage	2023-06-15 00:00:00	2023-10-15 00:00:00	\N	3	11	12
14	Task 14	Ensure all transcripts are sent into LSAC	To Do	High	Analytics	2023-04-05 00:00:00	2023-08-05 00:00:00	\N	3	7	8
15	Task 15	Check LSAC GPA on academic summary report	Work In Progress	Urgent	Encryption	2023-05-01 00:00:00	2023-09-01 00:00:00	\N	3	9	10
17	Task 17	Receive November LSAT, decide if you will keep, cancel, or retake.	Work In Progress	Urgent	Testing, Hardware	2023-07-10 00:00:00	2023-11-10 00:00:00	\N	3	13	14
26	Task 26	Update internal tooling for development teams.	To Do	Backlog	Tooling	2023-06-25 00:00:00	2023-10-25 00:00:00	\N	25	11	12
27	Task 27	Prepare cloud migration strategy document.	Work In Progress	Urgent	Cloud Migration	2023-07-20 00:00:00	2023-11-20 00:00:00	\N	26	13	14
42	Task 42	Go on visits to law schools\n	\N	\N	\N	\N	\N	\N	26	1	1
41	Task 41	Start receiving scholarship awards from law schools, be prepared to write negotiation letters to negotiate scholarship amounts.	\N	\N	\N	\N	\N	\N	26	1	1
28	Task 28	Design scalable database architecture.	To Do	Medium	Database Design	2023-08-15 00:00:00	2023-12-15 00:00:00	\N	27	15	16
38	Task 38	Revise mobile app to incorporate new payment integrations.	To Do	Medium	Mobile, Payments	2023-12-05 00:00:00	2024-02-05 00:00:00	\N	27	14	15
47	Task 47	Congratulations! You’re ready to attend law school.	\N	\N	\N	\N	\N	\N	27	1	1
46	Task 46	Make first seat deposit for your chosen law school. \n	\N	\N	\N	\N	\N	\N	27	1	1
45	Task 45	Decide which law school you will attend.\nResources: Choosing a law school.\n	\N	\N	\N	\N	\N	\N	27	1	1
44	Task 44	Attend admitted students day at law schools.\n	\N	\N	\N	\N	\N	\N	27	1	1
43	Task 43	Go on visits to law schools. \n	\N	\N	\N	\N	\N	\N	27	1	1
29	Task 29	Prototype new mobile technology.	Work In Progress	Urgent	Mobile Tech	2023-09-10 00:00:00	2024-01-10 00:00:00	\N	28	17	18
39	Task 39	Update cloud configuration to optimize costs.	Work In Progress	Urgent	Cloud, Cost Saving	2023-12-10 00:00:00	2024-02-10 00:00:00	\N	28	16	17
50	Task 50	 	\N	\N	\N	\N	\N	\N	28	1	1
49	Task 49	 	\N	\N	\N	\N	\N	\N	28	1	1
48	Task 48	 	\N	\N	\N	\N	\N	\N	28	1	1
30	Task 30	Enhance data encryption levels.	To Do	High	Encryption	2023-10-15 00:00:00	2024-02-15 00:00:00	\N	29	19	20
12	Task 12	Use Application Tracker in MYPLATT to see what schools require.\n	Under Review	High	Security	2023-02-10 00:00:00	2023-06-10 00:00:00	\N	2	2	4
3	Practice tests	Take a minimum of 2 practice tests this month.	Under Review	Urgent	Practice	\N	2023-09-20 00:00:00	0	1	5	6
101	Research	Research LSAT study materials and determine which is best for you\nRecommendations: 7sage, Powerscore, LSAT Demon\nResources: \n[Ultimate LSAT Prep](https://www.youtube.com/watch?v=KRcdXCRrnrA&list=PLVgqS5tYxGftaRKtj4LSCBgNnR9r481h5)\n	To Do	Medium		\N	\N	0	101	1	1
21	Task 21	Look into schools’ scholarship essays and determine if you will write those.	To Do	Medium	LSAT	2023-01-30 00:00:00	2023-05-30 00:00:00	\N	4	1	3
4	Weaknesses	Identify your application weaknesses\nResources:\n[List of common application weaknesses](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month1/Law_school_application_weaknesses.docx)\n	Under Review	High	Weaknesses	\N	2023-06-25 00:00:00	0	1	7	8
115	Practice test	Take a practice LSAT test	To Do	Medium		\N	\N	0	103	1	1
109	Create school list	Begin creating your school list based on your research\nResources:\n[School selection spreadsheet](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month2/Law_school_Selection_sheet.xlsx)\n	To Do	Medium		\N	\N	0	102	1	1
111	Law school list	Finalize your law school list. 	Work In Progress	Medium		\N	\N	0	103	1	1
2	Track LSAT study	Spend about 3-4 hours per day M-F or 15-20 hours/week on LSAT studying\n\nComments/suggestions: you will need to gauge this depending on how close/far you are from your LSAT goal. \n\n[Wrong Answer Journal](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month1/Wrong_answer_journal_.docx)	Work In Progress	High	Study	\N	2023-05-15 00:00:00	0	1	3	4
106	Create LSAC account	Create an LSAC account on LSAC.org	Completed	Medium		\N	\N	0	102	1	1
112	Data collection	Get the 25/50/75 percentiles for GPA and LSAT for all your schools, add it to your spreadsheet.\n	Work In Progress	Medium		\N	\N	0	103	1	1
117	Wrong answer tracker	Start using a wrong answer tracker to track what you are missing\nResources:\n[LSAT wrong answer tracker](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month3/Wrong_answer_journal_.docx)\n	To Do	Medium		\N	\N	0	103	1	1
116	Blind review	 Do a blind review of your practice test\nSuggestions/comments: At this point you are probably around 40-60 hours of LSAT studying. Guage how much you have improved since your diagnostic test. \n	Under Review	Medium		\N	\N	0	103	1	1
8	Deadlines	Use Tracker in MYPLATT and take note of priority deadlines for law schools.\n	Completed	High	Priority deadlines	\N	2023-10-01 00:00:00	0	1	15	16
108	Continue Studying	Continue studying for the LSAT minimum of 5 hours per week\n	To Do	Medium		\N	\N	0	102	1	1
105	Continue studying	Continue LSAT studying – wrap up the basic of the test.\n	Work In Progress	Medium		\N	\N	0	101	1	1
9	Task 9	Take an LSAT practice test at least 4 days before your test if taking November. Decide if you will take that test and/or if you will register for January.\n	To Do	Urgent	LSAT	2023-06-10 00:00:00	2023-12-10 00:00:00	\N	2	17	18
10	Task 10	Solidify your law school list based on research\nResources:\n[Researching law schools – what to research and where](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month2/Researching+law+schools.mp4)\n[School selection spreadsheet](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month2/Law_school_Selection_sheet.xlsx)\n	To Do	Medium	Research	2023-07-05 00:00:00	2024-01-05 00:00:00	\N	2	19	20
107	Research schools	Begin researching law schools to determine what schools you would like to attend\nResources:\n[Researching law schools – what to research and where](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month2/Researching+law+schools.mp4)\n	To Do	Medium		\N	\N	0	102	1	1
110	Start drilling	Incorporate drilling in LSAT studying \nSuggestions/comments: Review drills until you understand why you got something wrong.	To Do	Medium		\N	\N	0	102	1	1
113	Goal LSAT score	Set a goal LSAT based on your law school list.	To Do	Medium		\N	\N	0	103	1	1
114	Add schools	Add schools to MyPLATT tracker.	To Do	Medium		\N	\N	0	103	1	1
103	LSAT study schedule	Create an LSAT study schedule \nResource:\n[Blank study schedule](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month1/Schedule_Template.xlsx)\n[LSAT study schedule video](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month1/LSAT+study+schedule.mp4)	To Do	Medium		\N	\N	0	101	1	1
104	Start studying	Start studying for the LSAT for a minimum of 5 hours per week\nSuggestions/comments: \nFocus on learning the basics of the LSAT. Understand the fundamentals before jumping into drilling and practice tests.\n	To Do	Medium		\N	\N	0	101	1	1
5	Strengthen App	Add strengths to your application, if need be, where can you start making changes, to add more strength? Write down what you can do.\nResources:\n[Law school application strength additions](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month1/Application_Strengths.docx)\n	Completed	Urgent	Research	\N	2023-10-20 00:00:00	0	1	9	10
102	Take diagnostic	Take an LSAT diagnostic test – free to take online\n	To Do	Medium		\N	\N	0	101	1	1
11	Task 11	Create outlines for your application materials\n[Personal Statement Outline](https://mp-s3-images.s3.us-east-1.amazonaws.com/MYPLATT_Resources/Month2/Personal_Statement_Outline.docx)	Work In Progress	Urgent	Materials	2023-01-20 00:00:00	2023-05-20 00:00:00	\N	2	1	3
40	Task 40	Implement automated backup procedures for critical data.	To Do	High	Backup, Automation	2023-12-15 00:00:00	2024-02-15 00:00:00	\N	29	18	19
31	Task 31	Refactor backend code for better maintainability.	Work In Progress	Urgent	Refactoring, Backend	2023-11-01 00:00:00	2024-03-01 00:00:00	\N	30	20	1
32	Task 32	Expand the network infrastructure to support increased traffic.	To Do	Medium	Networking, Infrastructure	2023-11-05 00:00:00	2024-01-05 00:00:00	\N	31	2	3
25	Task 25	Integrate new API for third-party services.	Work In Progress	Urgent	API Integration	2023-05-05 00:00:00	2023-09-05 00:00:00	\N	31	9	10
33	Task 33	Create a new client dashboard interface.	Work In Progress	Urgent	UI, Dashboard	2023-11-10 00:00:00	2024-02-10 00:00:00	\N	31	4	5
34	Task 34	Develop an automated testing framework for new software releases.	To Do	Medium	Testing, Automation	2023-11-15 00:00:00	2024-03-15 00:00:00	\N	31	6	7
35	Task 35	Optimize database queries to improve application performance.	Work In Progress	Urgent	Database, Optimization	2023-11-20 00:00:00	2024-01-20 00:00:00	\N	31	8	9
36	Task 36	Implement end-user training for new system features.	To Do	Backlog	Training, User Experience	2023-11-25 00:00:00	2024-01-25 00:00:00	\N	31	10	11
37	Task 37	Conduct a comprehensive security audit of the existing infrastructure.	Work In Progress	Urgent	Security, Audit	2023-12-01 00:00:00	2024-02-01 00:00:00	\N	31	12	13
22	Task 22	Edit and review all materials.	To Do	Medium	LSAT	2023-02-20 00:00:00	2023-06-20 00:00:00	\N	4	2	4
23	Task 23	Submit application materials.	To Do	Medium	recommender	2023-03-25 00:00:00	2023-07-25 00:00:00	\N	4	5	6
24	Task 24	If January LSAT, submit once received.	To Do	High	Feedback	2023-04-15 00:00:00	2023-08-15 00:00:00	\N	4	7	8
\.


--
-- Data for Name: TaskAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TaskAssignment" (id, "userId", "taskId") FROM stdin;
1	1	1
2	2	2
3	3	3
4	4	4
5	5	5
6	6	6
7	7	7
8	8	8
9	9	9
10	10	10
11	11	11
12	12	12
13	13	13
14	14	14
15	15	15
16	16	16
17	17	17
18	18	18
19	19	19
20	20	20
21	1	21
22	2	22
23	3	23
24	4	24
25	5	25
26	6	26
27	7	27
28	8	28
29	9	29
30	10	30
\.


--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Team" (id, "teamName", "productOwnerUserId", "projectManagerUserId") FROM stdin;
1	Quantum Innovations	11	2
2	Nebula Research	13	4
3	Orion Solutions	15	6
4	Krypton Developments	17	8
5	Zenith Technologies	19	10
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" ("userId", "cognitoId", username, "profilePictureUrl", "teamId", email, "firstName", "lastName", "subscriptionStatus", "selectedTrack", "createdAt") FROM stdin;
2	123e4567-e89b-12d3-a456-426614174002	BobSmith	p2.jpeg	2	bob.smith@example.com	Bob	Smith	inactive	\N	2025-01-06 03:33:00.688
3	123e4567-e89b-12d3-a456-426614174003	CarolWhite	p3.jpeg	3	carol.white@example.com	Carol	White	active	\N	2025-01-06 03:33:00.688
4	213b7530-1031-70e0-67e9-fe0805e18fb3	DaveBrown	p4.jpeg	4	dave.brown@example.com	Dave	Brown	inactive	\N	2025-01-06 03:33:00.688
5	123e4567-e89b-12d3-a456-426614174005	EveClark	p5.jpeg	5	eve.clark@example.com	Eve	Clark	active	\N	2025-01-06 03:33:00.688
6	123e4567-e89b-12d3-a456-426614174006	FrankWright	p6.jpeg	1	frank.wright@example.com	Frank	Wright	inactive	\N	2025-01-06 03:33:00.688
7	123e4567-e89b-12d3-a456-426614174007	GraceHall	p7.jpeg	2	grace.hall@example.com	Grace	Hall	inactive	\N	2025-01-06 03:33:00.688
8	123e4567-e89b-12d3-a456-426614174008	HenryAllen	p8.jpeg	3	henry.allen@example.com	Henry	Allen	inactive	\N	2025-01-06 03:33:00.688
9	123e4567-e89b-12d3-a456-426614174009	IdaMartin	p9.jpeg	4	ida.martin@example.com	Ida	Martin	inactive	\N	2025-01-06 03:33:00.688
10	123e4567-e89b-12d3-a456-426614174010	JohnDoe	p10.jpeg	5	john.doe@example.com	John	Doe	active	\N	2025-01-06 03:33:00.688
11	123e4567-e89b-12d3-a456-426614174011	LauraAdams	p11.jpeg	1	laura.adams@example.com	Laura	Adams	inactive	\N	2025-01-06 03:33:00.688
12	123e4567-e89b-12d3-a456-426614174012	NormanBates	p12.jpeg	2	norman.bates@example.com	Norman	Bates	active	\N	2025-01-06 03:33:00.688
13	123e4567-e89b-12d3-a456-426614174013	OliviaPace	p13.jpeg	3	olivia.pace@example.com	Olivia	Pace	inactive	\N	2025-01-06 03:33:00.688
14	123e4567-e89b-12d3-a456-426614174014	PeterQuill	p1.jpeg	4	peter.quill@example.com	Peter	Quill	active	\N	2025-01-06 03:33:00.688
15	123e4567-e89b-12d3-a456-426614174015	QuincyAdams	p2.jpeg	5	quincy.adams@example.com	Quincy	Adams	inactive	\N	2025-01-06 03:33:00.688
16	123e4567-e89b-12d3-a456-426614174016	RachelGreen	p3.jpeg	1	rachel.green@example.com	Rachel	Green	active	\N	2025-01-06 03:33:00.688
17	123e4567-e89b-12d3-a456-426614174017	SteveJobs	p4.jpeg	2	steve.jobs@example.com	Steve	Jobs	inactive	\N	2025-01-06 03:33:00.688
18	123e4567-e89b-12d3-a456-426614174018	TinaFey	p5.jpeg	3	tina.fey@example.com	Tina	Fey	inactive	\N	2025-01-06 03:33:00.688
19	123e4567-e89b-12d3-a456-426614174019	UrsulaMonroe	p6.jpeg	4	ursula.monroe@example.com	Ursula	Monroe	active	\N	2025-01-06 03:33:00.688
20	123e4567-e89b-12d3-a456-426614174020	VictorHugo	p7.jpeg	5	victor.hugo@example.com	Victor	Hugo	inactive	\N	2025-01-06 03:33:00.688
36	248854d8-c0c1-7042-aa67-4395ffe79548	teresaflickinger2@gmail.com	pd1.jpg	1	teresaflickinger2@gmail.com	Teresa	Flickinger	active	2025	2024-10-01 03:33:33.333
33	74285428-0041-7030-c003-e320a5e51f61	redinarapi	pd1.jpg	1	rrapi@sas.upenn.edu	Redina	Rapi	active	2026	2024-10-01 03:33:33.333
30	b4d80438-b081-7025-1adc-d6f95479680f	Starr	pd1.jpg	5	aponexs@aol.com	Admin	User	active	2026	2024-10-01 03:33:33.333
28	f4780418-d091-7050-e582-528846a54c3c	Aponex	pd1.jpg	1	aponex@gmail.com	Chris	Grey	active	2025	2024-11-01 03:33:33.333
40	74c85448-b071-7092-43ee-ade8275fafec	johnsokn7	pd1.jpg	1	keyaraj@vt.edu	Keyara	Johnson	inactive	2026	2024-10-01 03:33:33.333
35	7428a4b8-6051-705d-0389-b31bf05766c1	marlene4588	pd1.jpg	1	marlene4588@gmail.com	Marlene	Sanchez	inactive	2025	2024-10-01 03:33:33.333
1	123e4567-e89b-12d3-a456-426614174001	MyPLATT	p1.jpeg	1	alice.jones@example.com	MyPLATT	 	inactive	\N	2025-10-01 03:33:00.688
29	74488448-c071-70b0-28db-644fc67f3f11	Sephoragrey	pd1.jpg	1	sephora.grey@gmail.com	Sephora	Grey	active	2026	2024-10-01 03:33:33.333
31	54683438-4051-7046-70aa-2230749d5738	randimangra@hotmail.com	pd1.jpg	1	randimangra@hotmail.com	Randi	Mangra	active	2026	2024-10-01 03:33:33.333
32	d4b8d488-a051-7085-07e6-964bc10e8887	bkw_777	pd1.jpg	1	breannakayshepherd@gmail.com	Breanna	Wilson	active	2026	2024-10-01 03:33:33.333
34	e4d804e8-f061-7008-efe2-85ebf43ae394	tathiananmr	pd1.jpg	1	tathiananmr@gmail.com	Tathiana	Musignac	active	2025	2024-10-01 03:33:33.333
37	e48824f8-20d1-7085-dc63-4eba2e46e00d	EF0085	pd1.jpg	1	efezum7@gmail.com	Salem	Fezum	active	2025	2024-10-01 03:33:33.333
38	74d804b8-b0b1-7083-a12a-4fa21e2145b8	mromero0036	pd1.jpg	1	mromero0036@gmail.com	MAYRA	ROMERO	active	2026	2024-10-01 03:33:33.333
39	d4f894a8-5011-70d5-bf3b-09424952f302	kmrayfield	pd1.jpg	1	kiyanamrayfield@gmail.com	Kiyana	Rayfield	active	2026	2024-10-01 03:33:33.333
41	04b8f438-3021-7023-64ad-364ede8d0bca	Id2522	pd1.jpg	1	ivon.alvarez.diaz@gmail.com	Ivon	Diaz Alvarez	active	2026	2024-10-01 03:33:33.333
42	f4c85438-b0c1-705c-503f-b7f98e87a435	alexusyabeny	pd1.jpg	1	yabenyalexus@gmail.com	Alexus	Yabeny	active	2026	2024-10-01 03:33:33.333
43	4468a418-b021-705d-699a-0bb5bccc104e	alma_aldaco10@	pd1.jpg	1	alma_aldaco10@yahoo.com	Alma	Aldaco	active	2026	2024-10-01 03:33:33.333
44	b458d468-f051-70d7-aa6b-36269cbe84c8	conyeike922	pd1.jpg	1	conyeike23@gmail.com	Collins 	Onyeike 	active	2026	2024-10-01 03:33:00.688
46	7428c478-2021-708a-cf99-9e06754b0e10	MyaY22	pd1.jpg	1	myayoung10@gmail.com	Mya 	Young 	active	2026	2025-01-07 00:16:18.776
47	a42894c8-d011-700c-3b57-eb860b9bc808	gannaamalik	pd1.jpg	1	gannaamalik@gmail.com	Ganna	Malik	active	2026	2025-01-09 16:43:33.562
48	942804c8-e081-70f2-4730-000338d8ffcf	cortneybranche	pd1.jpg	1	cortneybranche@gmail.com	Cortney	Branche	active	2026	2025-01-09 20:55:47.282
49	d448d4d8-60a1-7030-ba56-c27914decedb	Ambwalts11	pd1.jpg	1	ambwalts11@gmail.com	Amber	Walters	active	2026	2025-01-09 21:14:40.236
50	e47884d8-e0e1-706f-cdec-b3b543005697	Atiramdotson	pd1.jpg	1	atiramdotson@gmail.com	Atira	Dotson	active	2026	2025-01-11 17:14:40.236
45	64282478-00a1-70ca-fee8-ca6e26bbb8c6	samanthalouie	pd1.jpg	1	louiemsamantha@gmail.com	Samantha	Louie	inactive	2026	2025-01-06 23:01:38.586
51	f4085478-2091-7070-3bb0-cb87ab603fed	mahip120	pd1.jpg	1	p.n.mahi120@gmail.com	Mahi	Patel	active	2026	2025-01-15 21:21:07.369
52	34b84498-f0c1-70f1-1956-2ae93a16a3b2	Jcruickshank22@hotmail.com	pd1.jpg	1	jcruickshank22@hotmail.com	Jessica	Cruickshank 	active	2026	2025-01-15 22:23:38.25
53	d4789438-4041-7046-ee65-ff3a5b5b7a81	leylaxsaid	pd1.jpg	1	leylaxsaid@gmail.com	leyla	said	active	2026	2025-01-16 20:10:08.759
54	84086418-c031-70df-022e-6f43699c64ae	Lourdes77712	pd1.jpg	1	lourdes77712@gmail.com	Lourdes	Arellano	active	2026	2025-01-22 17:27:33.368
55	54a83418-7081-705a-8161-be53be918030	kgarcia	pd1.jpg	1	Garciakathya26@gmail.com	Kathya	Garcia	active	2026	2025-01-23 23:47:21.921
56	54183478-1001-7039-3132-b394ae39454b	KayProEsquire	pd1.jpg	1	uagc.kimberly@gmail.com	Kimberly	Greene	active	2026	2025-01-24 22:38:36.035
57	74c8f4c8-a001-70d7-feb8-568046b90199	Brenda.p	pd1.jpg	1	brendalisportes2003@gmail.com	Brendalis	Portes	active	2026	2025-01-27 01:10:32.002
58	943834b8-e091-7009-4eec-111ebed5d816	molly.wilgus	pd1.jpg	1	molly.wilgus18@gmail.com	Molly	Wilgus	active	2026	2025-01-27 12:40:23.8
\.


--
-- Data for Name: UserTasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserTasks" (id, "userId", "taskId", status, priority) FROM stdin;
2	28	10	To Do	Urgent
5	28	14	To Do	High
6	28	15	Work In Progress	Urgent
7	28	16	To Do	Backlog
8	28	17	Work In Progress	Urgent
9	28	18	To Do	High
10	28	19	Work In Progress	Urgent
11	28	20	To Do	Urgent
12	28	21	Work In Progress	Urgent
14	28	24	To Do	High
15	28	25	Work In Progress	Urgent
16	28	26	To Do	Backlog
17	28	27	Work In Progress	Urgent
18	28	28	To Do	Medium
19	28	29	Work In Progress	Urgent
20	28	30	To Do	High
21	28	31	Work In Progress	Urgent
23	28	34	To Do	Medium
24	28	35	Work In Progress	Urgent
25	28	36	To Do	Backlog
26	28	37	Work In Progress	Urgent
27	28	38	To Do	Medium
28	28	39	Work In Progress	Urgent
29	28	40	To Do	High
30	28	3	To Do	Urgent
31	28	4	To Do	High
33	28	5	To Do	Urgent
34	28	2	To Do	High
36	28	6	To Do	Backlog
37	28	7	To Do	Urgent
38	28	8	To Do	High
1107	29	104	Under Review	Medium
4	28	13	To Do	Urgent
13	28	23	To Do	Urgent
22	28	33	To Do	Urgent
641	28	50	To Do	Medium
642	28	49	To Do	Medium
643	28	48	To Do	Medium
644	28	47	To Do	Medium
645	28	46	To Do	Medium
646	28	45	To Do	Medium
647	28	44	To Do	Medium
648	28	43	To Do	Medium
649	28	42	To Do	Medium
650	28	41	To Do	Medium
3362	35	7	To Do	Urgent
1104	30	102	To Do	Medium
1105	30	101	To Do	Medium
1106	29	105	To Do	Medium
1108	29	103	To Do	Medium
1109	29	102	To Do	Medium
1101	30	105	Work In Progress	Medium
1152	30	111	To Do	Medium
1154	30	109	To Do	Medium
1155	30	108	To Do	Medium
1156	30	107	To Do	Medium
1157	30	106	To Do	Medium
1188	29	111	To Do	Medium
1190	29	109	To Do	Medium
1191	29	108	To Do	Medium
1192	29	107	To Do	Medium
1193	29	106	To Do	Medium
1242	30	116	To Do	Medium
1243	30	115	To Do	Medium
1244	30	114	To Do	Medium
1245	30	113	To Do	Medium
1246	30	117	To Do	Medium
1344	29	116	To Do	Medium
1345	29	115	To Do	Medium
1346	29	114	To Do	Medium
1347	29	113	To Do	Medium
1348	29	117	To Do	Medium
1189	29	110	Work In Progress	Medium
1153	30	110	To Do	Medium
1102	30	104	Under Review	Medium
1103	30	103	Completed	Medium
3363	35	1	To Do	Urgent
3364	35	13	Work In Progress	Urgent
3365	35	6	To Do	Backlog
1110	29	101	Work In Progress	Medium
32	28	1	To Do	Urgent
39	28	12	To Do	High
35	28	32	To Do	Medium
40	28	22	To Do	High
3	28	11	To Do	Urgent
1	28	9	To Do	Urgent
1187	29	112	To Do	Medium
3278	33	104	To Do	Medium
3280	33	112	To Do	Medium
3281	33	111	To Do	Medium
3282	33	110	To Do	Medium
3283	33	108	To Do	Medium
3284	33	106	To Do	Medium
3285	33	116	To Do	Medium
3286	33	115	To Do	Medium
3287	33	114	To Do	Medium
3288	33	113	To Do	Medium
3289	33	107	To Do	Medium
3290	33	109	To Do	Medium
3291	33	117	To Do	Medium
3292	33	103	To Do	Medium
3366	35	16	To Do	Backlog
3367	35	14	To Do	High
3368	35	15	Work In Progress	Urgent
3369	35	17	Work In Progress	Urgent
3370	35	18	To Do	High
3371	35	19	Work In Progress	Urgent
3372	35	20	To Do	Urgent
3373	35	26	To Do	Backlog
3374	35	27	Work In Progress	Urgent
3375	35	42	To Do	Medium
3376	35	41	To Do	Medium
3377	35	28	To Do	Medium
3378	35	38	To Do	Medium
3379	35	47	To Do	Medium
3380	35	46	To Do	Medium
3381	35	45	To Do	Medium
3382	35	44	To Do	Medium
3383	35	43	To Do	Medium
3384	35	29	Work In Progress	Urgent
3385	35	39	Work In Progress	Urgent
3386	35	50	To Do	Medium
3387	35	49	To Do	Medium
3388	35	48	To Do	Medium
3389	35	30	To Do	High
3390	35	5	To Do	Urgent
3391	35	21	Work In Progress	Urgent
3392	35	12	To Do	High
3393	35	9	To Do	Urgent
3279	33	102	Work In Progress	Medium
3293	33	101	Completed	Medium
1151	30	112	Work In Progress	Medium
3394	35	10	To Do	Medium
3395	35	2	To Do	High
3396	35	3	To Do	Urgent
3397	35	4	To Do	High
3398	35	8	To Do	High
3399	35	11	Work In Progress	Urgent
3400	35	40	To Do	High
3401	35	31	Work In Progress	Urgent
3402	35	22	Work In Progress	High
3403	35	32	To Do	Medium
3404	35	25	Work In Progress	Urgent
3405	35	33	Work In Progress	Urgent
3406	35	23	Work In Progress	Urgent
3407	35	24	To Do	High
3408	35	34	To Do	Medium
3409	35	35	Work In Progress	Urgent
3410	35	36	To Do	Backlog
3411	35	37	Work In Progress	Urgent
3447	37	1	To Do	Urgent
3448	37	13	Work In Progress	Urgent
3449	37	6	To Do	Backlog
3450	37	16	To Do	Backlog
3451	37	14	To Do	High
3452	37	15	Work In Progress	Urgent
3454	37	18	To Do	High
3455	37	19	Work In Progress	Urgent
3456	37	20	To Do	Urgent
3457	37	26	To Do	Backlog
3458	37	27	Work In Progress	Urgent
3459	37	42	To Do	Medium
3460	37	41	To Do	Medium
3461	37	28	To Do	Medium
3462	37	38	To Do	Medium
3463	37	47	To Do	Medium
3464	37	46	To Do	Medium
3465	37	45	To Do	Medium
3466	37	44	To Do	Medium
3467	37	43	To Do	Medium
3468	37	29	Work In Progress	Urgent
3469	37	39	Work In Progress	Urgent
3470	37	50	To Do	Medium
3471	37	49	To Do	Medium
3472	37	48	To Do	Medium
3473	37	30	To Do	High
3474	37	5	To Do	Urgent
3475	37	21	Work In Progress	Urgent
3476	37	12	To Do	High
3477	37	9	To Do	Urgent
3478	37	10	To Do	Medium
3479	37	2	To Do	High
3480	37	3	To Do	Urgent
3481	37	4	To Do	High
3482	37	8	To Do	High
3483	37	11	Work In Progress	Urgent
3484	37	40	To Do	High
3485	37	31	Work In Progress	Urgent
3486	37	22	Work In Progress	High
3487	37	32	To Do	Medium
3488	37	25	Work In Progress	Urgent
3489	37	33	Work In Progress	Urgent
3490	37	23	Work In Progress	Urgent
3491	37	24	To Do	High
3492	37	34	To Do	Medium
3493	37	35	Work In Progress	Urgent
3494	37	36	To Do	Backlog
3495	37	37	Work In Progress	Urgent
3646	38	105	To Do	Medium
3647	38	104	To Do	Medium
3648	38	102	To Do	Medium
3649	38	112	To Do	Medium
3650	38	111	To Do	Medium
3651	38	110	To Do	Medium
3652	38	108	To Do	Medium
3653	38	106	To Do	Medium
3654	38	116	To Do	Medium
3655	38	115	To Do	Medium
3656	38	114	To Do	Medium
3657	38	113	To Do	Medium
3658	38	107	To Do	Medium
3659	38	109	To Do	Medium
3660	38	117	To Do	Medium
3661	38	103	To Do	Medium
3662	38	101	To Do	Medium
3697	36	105	To Do	Medium
3698	36	104	To Do	Medium
3699	36	102	To Do	Medium
3700	36	112	To Do	Medium
3701	36	111	To Do	Medium
3702	36	110	To Do	Medium
3703	36	108	To Do	Medium
3704	36	106	To Do	Medium
3705	36	116	To Do	Medium
3706	36	115	To Do	Medium
3707	36	114	To Do	Medium
3708	36	113	To Do	Medium
3709	36	107	To Do	Medium
3710	36	109	To Do	Medium
3711	36	117	To Do	Medium
3712	36	103	To Do	Medium
3713	36	101	To Do	Medium
3767	32	112	To Do	Medium
3768	32	111	To Do	Medium
3769	32	110	To Do	Medium
3770	32	108	To Do	Medium
3771	32	106	To Do	Medium
3772	32	116	To Do	Medium
3773	32	115	To Do	Medium
3774	32	114	To Do	Medium
3775	32	113	To Do	Medium
3776	32	107	To Do	Medium
3777	32	109	To Do	Medium
3778	32	117	To Do	Medium
3851	39	102	To Do	Medium
3852	39	112	To Do	Medium
3853	39	111	To Do	Medium
3854	39	110	To Do	Medium
3855	39	108	To Do	Medium
3857	39	116	To Do	Medium
3858	39	115	To Do	Medium
3859	39	114	To Do	Medium
3860	39	113	To Do	Medium
3862	39	109	To Do	Medium
3863	39	117	To Do	Medium
3850	39	104	Work In Progress	Medium
3861	39	107	Work In Progress	Medium
3856	39	106	Completed	Medium
3446	37	7	To Do	Urgent
3453	37	17	Completed	Urgent
3765	32	104	Completed	Medium
3780	32	101	Completed	Medium
3766	32	102	Completed	Medium
3779	32	103	Completed	Medium
3764	32	105	Completed	Medium
3865	39	101	Work In Progress	Medium
3864	39	103	Work In Progress	Medium
3849	39	105	To Do	Medium
4035	34	7	To Do	Urgent
4038	34	6	To Do	Backlog
4039	34	16	To Do	Backlog
4040	34	14	To Do	High
4043	34	18	To Do	High
4044	34	19	Work In Progress	Urgent
4045	34	20	To Do	Urgent
4046	34	26	To Do	Backlog
4047	34	27	Work In Progress	Urgent
4048	34	42	To Do	Medium
4049	34	41	To Do	Medium
4050	34	28	To Do	Medium
4051	34	38	To Do	Medium
4052	34	47	To Do	Medium
4053	34	46	To Do	Medium
4054	34	45	To Do	Medium
4055	34	44	To Do	Medium
4056	34	43	To Do	Medium
4057	34	29	Work In Progress	Urgent
4058	34	39	Work In Progress	Urgent
4059	34	50	To Do	Medium
4060	34	49	To Do	Medium
4061	34	48	To Do	Medium
4062	34	30	To Do	High
4063	34	5	To Do	Urgent
4064	34	21	Work In Progress	Urgent
4065	34	12	To Do	High
4066	34	9	To Do	Urgent
4067	34	10	To Do	Medium
4068	34	2	To Do	High
4069	34	3	To Do	Urgent
4070	34	4	To Do	High
4071	34	8	To Do	High
4073	34	40	To Do	High
4074	34	31	Work In Progress	Urgent
4075	34	22	Work In Progress	High
4076	34	32	To Do	Medium
4077	34	25	Work In Progress	Urgent
4078	34	33	Work In Progress	Urgent
4079	34	23	Work In Progress	Urgent
4080	34	24	To Do	High
4081	34	34	To Do	Medium
4082	34	35	Work In Progress	Urgent
4083	34	36	To Do	Backlog
4084	34	37	Work In Progress	Urgent
4036	34	1	Under Review	Urgent
4072	34	11	To Do	Urgent
4042	34	17	To Do	Urgent
4041	34	15	To Do	Urgent
4037	34	13	To Do	Urgent
4445	42	114	To Do	Medium
4451	42	101	Completed	Medium
4437	42	102	Completed	Medium
4450	42	103	Completed	Medium
4436	42	104	Completed	Medium
4435	42	105	Completed	Medium
4442	42	106	Completed	Medium
4447	42	107	Completed	Medium
4441	42	108	Completed	Medium
4448	42	109	Completed	Medium
4440	42	110	Completed	Medium
4438	42	112	Completed	Medium
4439	42	111	Completed	Medium
4672	41	105	To Do	Medium
4675	41	112	To Do	Medium
4676	41	111	To Do	Medium
4677	41	110	To Do	Medium
4678	41	108	To Do	Medium
4680	41	116	To Do	Medium
4681	41	115	To Do	Medium
4682	41	114	To Do	Medium
4683	41	113	To Do	Medium
4685	41	109	To Do	Medium
4686	41	117	To Do	Medium
4679	41	106	Completed	Medium
4684	41	107	Completed	Medium
4673	41	104	To Do	Medium
4688	41	101	Completed	Medium
4674	41	102	Completed	Medium
4687	41	103	Completed	Medium
4840	43	105	To Do	Medium
4841	43	104	To Do	Medium
4842	43	102	To Do	Medium
4843	43	112	To Do	Medium
4844	43	111	To Do	Medium
4845	43	110	To Do	Medium
4846	43	108	To Do	Medium
4847	43	106	To Do	Medium
4848	43	116	To Do	Medium
4849	43	115	To Do	Medium
4850	43	114	To Do	Medium
4851	43	113	To Do	Medium
4852	43	107	To Do	Medium
4853	43	109	To Do	Medium
4854	43	117	To Do	Medium
4855	43	103	To Do	Medium
4856	43	101	To Do	Medium
3277	33	105	To Do	Medium
4444	42	115	Completed	Medium
4449	42	117	Completed	Medium
4446	42	113	Completed	Medium
4443	42	116	Completed	Medium
6949	30	118	To Do	Medium
6950	30	122	To Do	Medium
6951	30	121	To Do	Medium
6952	30	120	To Do	Medium
6953	30	124	To Do	Medium
6954	30	123	To Do	Medium
6955	30	119	To Do	Medium
7441	28	118	To Do	Medium
7442	28	122	To Do	Medium
7443	28	121	To Do	Medium
7444	28	120	To Do	Medium
7445	28	124	To Do	Medium
7446	28	123	To Do	Medium
7447	28	119	To Do	Medium
7448	28	105	To Do	Medium
7449	28	104	To Do	Medium
7450	28	102	To Do	Medium
7451	28	112	To Do	Medium
7452	28	111	To Do	Medium
7453	28	110	To Do	Medium
7454	28	108	To Do	Medium
7455	28	106	To Do	Medium
7456	28	116	To Do	Medium
7457	28	115	To Do	Medium
7458	28	114	To Do	Medium
7459	28	113	To Do	Medium
7460	28	107	To Do	Medium
7461	28	109	To Do	Medium
7462	28	117	To Do	Medium
7463	28	103	To Do	Medium
7464	28	101	To Do	Medium
7713	30	18	To Do	High
7714	30	19	To Do	High
7715	30	20	To Do	Medium
7716	30	7	To Do	Urgent
7717	30	1	To Do	Urgent
7718	30	13	Work In Progress	Urgent
7719	30	6	To Do	Backlog
7720	30	16	To Do	Backlog
7721	30	14	To Do	High
7722	30	15	Work In Progress	Urgent
7723	30	17	Work In Progress	Urgent
7724	30	26	To Do	Backlog
7725	30	27	Work In Progress	Urgent
7726	30	42	To Do	Medium
7727	30	41	To Do	Medium
7728	30	28	To Do	Medium
7729	30	38	To Do	Medium
7730	30	47	To Do	Medium
7731	30	46	To Do	Medium
7732	30	45	To Do	Medium
7733	30	44	To Do	Medium
7734	30	43	To Do	Medium
7735	30	29	Work In Progress	Urgent
7736	30	39	Work In Progress	Urgent
7737	30	50	To Do	Medium
7738	30	49	To Do	Medium
7739	30	48	To Do	Medium
7740	30	30	To Do	High
7741	30	21	To Do	Medium
7742	30	5	To Do	Urgent
7743	30	12	To Do	High
7744	30	9	To Do	Urgent
7745	30	10	To Do	Medium
7746	30	2	To Do	High
7747	30	3	To Do	Urgent
7748	30	4	To Do	High
7749	30	8	To Do	High
7750	30	11	Work In Progress	Urgent
7751	30	40	To Do	High
7752	30	31	Work In Progress	Urgent
7753	30	32	To Do	Medium
7754	30	25	Work In Progress	Urgent
7755	30	33	Work In Progress	Urgent
7756	30	34	To Do	Medium
7757	30	35	Work In Progress	Urgent
7758	30	36	To Do	Backlog
7759	30	37	Work In Progress	Urgent
7760	30	22	To Do	Medium
7761	30	23	To Do	Medium
7762	30	24	To Do	High
8671	39	118	To Do	Medium
8672	39	122	To Do	Medium
8673	39	121	To Do	Medium
8674	39	120	To Do	Medium
8675	39	124	To Do	Medium
8676	39	123	To Do	Medium
8677	39	119	To Do	Medium
8791	29	118	To Do	Medium
8792	29	122	To Do	Medium
8793	29	121	To Do	Medium
8794	29	120	To Do	Medium
8795	29	124	To Do	Medium
8796	29	123	To Do	Medium
8797	29	119	To Do	Medium
11821	36	118	To Do	Medium
11822	36	122	To Do	Medium
11823	36	121	To Do	Medium
11824	36	120	To Do	Medium
11825	36	124	To Do	Medium
11826	36	119	To Do	Medium
11827	36	123	To Do	Medium
11869	46	118	To Do	Medium
11870	46	122	To Do	Medium
11871	46	121	To Do	Medium
11872	46	120	To Do	Medium
11873	46	124	To Do	Medium
11874	46	119	To Do	Medium
11875	46	123	To Do	Medium
11876	46	109	Completed	Medium
11877	46	101	To Do	Medium
11878	46	104	To Do	Medium
11879	46	105	To Do	Medium
11880	46	112	Work In Progress	Medium
11881	46	117	To Do	Medium
11882	46	115	To Do	Medium
11883	46	106	To Do	Medium
11884	46	107	To Do	Medium
11885	46	108	Work In Progress	Medium
11886	46	110	To Do	Medium
11887	46	113	To Do	Medium
11888	46	114	To Do	Medium
11889	46	116	To Do	Medium
11890	46	111	To Do	Medium
11891	46	102	To Do	Medium
11892	46	103	To Do	Medium
12181	45	118	To Do	Medium
12182	45	122	To Do	Medium
12183	45	121	To Do	Medium
12184	45	120	To Do	Medium
12185	45	124	To Do	Medium
12186	45	119	To Do	Medium
12187	45	123	To Do	Medium
12188	45	109	Completed	Medium
12189	45	101	To Do	Medium
12190	45	104	To Do	Medium
12191	45	105	To Do	Medium
12192	45	112	Work In Progress	Medium
12193	45	117	To Do	Medium
12194	45	115	To Do	Medium
12195	45	106	To Do	Medium
12196	45	107	To Do	Medium
12197	45	108	Work In Progress	Medium
12198	45	110	To Do	Medium
12199	45	113	To Do	Medium
12200	45	114	To Do	Medium
12201	45	116	To Do	Medium
12202	45	111	To Do	Medium
12203	45	102	To Do	Medium
12204	45	103	To Do	Medium
12665	48	118	Under Review	Medium
12666	48	121	Work In Progress	Medium
12667	48	120	To Do	Medium
12668	48	124	To Do	Medium
12669	48	119	To Do	Medium
12670	48	122	Work In Progress	Medium
12671	48	123	To Do	Medium
12672	48	106	Completed	Medium
12673	48	101	Work In Progress	Medium
12674	48	102	Work In Progress	Medium
12675	48	105	To Do	Medium
12676	48	112	Work In Progress	Medium
12677	48	117	To Do	Medium
12678	48	115	To Do	Medium
12679	48	108	To Do	Medium
12680	48	109	Work In Progress	Medium
12681	48	110	To Do	Medium
12682	48	113	To Do	Medium
12683	48	114	To Do	Medium
12684	48	116	To Do	Medium
12685	48	111	To Do	Medium
12686	48	103	To Do	Medium
12687	48	104	To Do	Medium
12688	48	107	Work In Progress	Medium
12689	32	118	Under Review	Medium
12690	32	121	Work In Progress	Medium
12691	32	120	To Do	Medium
12692	32	124	To Do	Medium
12693	32	119	To Do	Medium
12694	32	122	Work In Progress	Medium
12695	32	123	To Do	Medium
12809	50	118	Under Review	Medium
12810	50	121	Work In Progress	Medium
12811	50	120	To Do	Medium
12812	50	124	To Do	Medium
12813	50	119	To Do	Medium
12814	50	122	Work In Progress	Medium
12815	50	123	To Do	Medium
12816	50	101	Completed	Medium
12817	50	105	Completed	Medium
12818	50	102	Work In Progress	Medium
12819	50	112	Work In Progress	Medium
12820	50	117	To Do	Medium
12821	50	115	To Do	Medium
12822	50	108	To Do	Medium
12823	50	109	Work In Progress	Medium
12824	50	103	Completed	Medium
12825	50	110	To Do	Medium
12826	50	113	To Do	Medium
12827	50	114	To Do	Medium
12828	50	116	To Do	Medium
12829	50	111	To Do	Medium
12830	50	104	Completed	Medium
12831	50	106	To Do	Medium
12832	50	107	Work In Progress	Medium
12979	51	118	Under Review	Medium
12980	51	121	Work In Progress	Medium
12981	51	120	To Do	Medium
12982	51	124	To Do	Medium
12983	51	119	To Do	Medium
12984	51	122	Work In Progress	Medium
12985	51	123	To Do	Medium
12986	51	104	Completed	Medium
12987	51	101	Completed	Medium
12988	51	105	Completed	Medium
12989	51	102	Work In Progress	Medium
12990	51	112	Work In Progress	Medium
12991	51	117	To Do	Medium
12992	51	115	To Do	Medium
12993	51	108	To Do	Medium
12994	51	109	Work In Progress	Medium
12995	51	103	Completed	Medium
12996	51	110	To Do	Medium
12997	51	113	To Do	Medium
12998	51	114	To Do	Medium
12999	51	116	To Do	Medium
13000	51	111	To Do	Medium
13001	51	106	To Do	Medium
13002	51	107	Work In Progress	Medium
13075	52	118	Under Review	Medium
13076	52	121	Work In Progress	Medium
13077	52	120	To Do	Medium
13078	52	124	To Do	Medium
13079	52	119	To Do	Medium
13080	52	122	Work In Progress	Medium
13081	52	123	To Do	Medium
13082	52	102	To Do	Medium
13083	52	103	To Do	Medium
13084	52	101	To Do	Medium
13085	52	105	To Do	Medium
13086	52	112	Work In Progress	Medium
13087	52	117	To Do	Medium
13088	52	115	To Do	Medium
13089	52	108	To Do	Medium
13090	52	109	Work In Progress	Medium
13091	52	104	To Do	Medium
13092	52	110	To Do	Medium
13093	52	113	To Do	Medium
13094	52	114	To Do	Medium
13095	52	116	To Do	Medium
13096	52	111	To Do	Medium
13097	52	106	To Do	Medium
13098	52	107	Work In Progress	Medium
13099	47	118	Under Review	Medium
13100	47	121	Work In Progress	Medium
13101	47	120	To Do	Medium
13102	47	124	To Do	Medium
13103	47	119	To Do	Medium
13104	47	122	Work In Progress	Medium
13105	47	123	To Do	Medium
13106	47	102	To Do	Medium
13107	47	103	To Do	Medium
13108	47	101	To Do	Medium
13109	47	105	To Do	Medium
13110	47	112	Work In Progress	Medium
13111	47	117	To Do	Medium
13112	47	115	To Do	Medium
13113	47	108	To Do	Medium
13114	47	109	Work In Progress	Medium
13115	47	104	To Do	Medium
13116	47	110	To Do	Medium
13117	47	113	To Do	Medium
13118	47	114	To Do	Medium
13119	47	116	To Do	Medium
13120	47	111	To Do	Medium
13121	47	106	To Do	Medium
13122	47	107	Work In Progress	Medium
13171	53	118	Under Review	Medium
13172	53	121	Work In Progress	Medium
13173	53	120	To Do	Medium
13174	53	124	To Do	Medium
13175	53	119	To Do	Medium
13176	53	122	Work In Progress	Medium
13177	53	123	To Do	Medium
13178	53	102	To Do	Medium
13179	53	103	To Do	Medium
13180	53	101	To Do	Medium
13181	53	105	To Do	Medium
13182	53	112	Work In Progress	Medium
13183	53	117	To Do	Medium
13184	53	115	To Do	Medium
13185	53	108	To Do	Medium
13186	53	109	Work In Progress	Medium
13187	53	104	To Do	Medium
13188	53	110	To Do	Medium
13189	53	113	To Do	Medium
13190	53	114	To Do	Medium
13191	53	116	To Do	Medium
13192	53	111	To Do	Medium
13193	53	106	To Do	Medium
13194	53	107	Work In Progress	Medium
13315	36	6	To Do	Medium
13316	36	18	To Do	High
13317	36	19	To Do	High
13318	36	20	To Do	Medium
13319	36	1	To Do	Medium
13320	36	7	Work In Progress	High
13321	36	13	Work In Progress	Urgent
13322	36	16	To Do	Backlog
13323	36	14	To Do	High
13324	36	15	Work In Progress	Urgent
13325	36	17	Work In Progress	Urgent
13326	36	26	To Do	Backlog
13327	36	27	Work In Progress	Urgent
13328	36	42	To Do	Medium
13329	36	41	To Do	Medium
13330	36	28	To Do	Medium
13331	36	38	To Do	Medium
13332	36	47	To Do	Medium
13333	36	46	To Do	Medium
13334	36	45	To Do	Medium
13335	36	44	To Do	Medium
13336	36	43	To Do	Medium
13337	36	29	Work In Progress	Urgent
13338	36	39	Work In Progress	Urgent
13339	36	50	To Do	Medium
13340	36	49	To Do	Medium
13341	36	48	To Do	Medium
13342	36	30	To Do	High
13343	36	12	Under Review	High
13344	36	3	Under Review	Urgent
13345	36	21	To Do	Medium
13346	36	4	Under Review	High
13347	36	2	Work In Progress	High
13348	36	8	Completed	High
13349	36	9	To Do	Urgent
13350	36	10	To Do	Medium
13351	36	5	Completed	Urgent
13352	36	11	Work In Progress	Urgent
13353	36	40	To Do	High
13354	36	31	Work In Progress	Urgent
13355	36	32	To Do	Medium
13356	36	25	Work In Progress	Urgent
13357	36	33	Work In Progress	Urgent
13358	36	34	To Do	Medium
13359	36	35	Work In Progress	Urgent
13360	36	36	To Do	Backlog
13361	36	37	Work In Progress	Urgent
13362	36	22	To Do	Medium
13363	36	23	To Do	Medium
13364	36	24	To Do	High
14441	42	120	To Do	Medium
14442	42	124	To Do	Medium
14443	42	119	To Do	Medium
14444	42	122	Work In Progress	Medium
14445	42	123	To Do	Medium
14446	42	121	To Do	Medium
14447	42	118	Work In Progress	Medium
14609	54	120	To Do	Medium
14610	54	124	To Do	Medium
14611	54	119	To Do	Medium
14612	54	122	Work In Progress	Medium
14613	54	123	To Do	Medium
14614	54	121	To Do	Medium
14615	54	118	Work In Progress	Medium
14616	54	102	Completed	Medium
14617	54	115	To Do	Medium
14618	54	109	To Do	Medium
14619	54	111	Work In Progress	Medium
14620	54	106	Completed	Medium
14621	54	112	Work In Progress	Medium
14622	54	117	To Do	Medium
14623	54	116	Under Review	Medium
14624	54	108	To Do	Medium
14625	54	105	To Do	Medium
14626	54	107	To Do	Medium
14627	54	110	To Do	Medium
14628	54	113	To Do	Medium
14629	54	114	To Do	Medium
14630	54	104	Work In Progress	Medium
14631	54	101	Completed	Medium
14632	54	103	Completed	Medium
14657	55	120	To Do	Medium
14658	55	124	To Do	Medium
14659	55	119	To Do	Medium
14660	55	122	Work In Progress	Medium
14661	55	123	To Do	Medium
14662	55	121	To Do	Medium
14663	55	118	Work In Progress	Medium
14664	55	102	Completed	Medium
14665	55	115	To Do	Medium
14666	55	109	To Do	Medium
14667	55	111	Work In Progress	Medium
14668	55	106	Completed	Medium
14669	55	112	Work In Progress	Medium
14670	55	117	To Do	Medium
14671	55	116	Under Review	Medium
14672	55	108	To Do	Medium
14673	55	105	Work In Progress	Medium
14674	55	107	To Do	Medium
14675	55	110	To Do	Medium
14676	55	113	To Do	Medium
14677	55	114	To Do	Medium
14678	55	104	Completed	Medium
14679	55	101	Completed	Medium
14680	55	103	Completed	Medium
14681	56	120	To Do	Medium
14682	56	124	To Do	Medium
14683	56	119	To Do	Medium
14684	56	122	Work In Progress	Medium
14685	56	123	To Do	Medium
14686	56	121	To Do	Medium
14687	56	118	Work In Progress	Medium
14688	56	101	To Do	Medium
14689	56	115	To Do	Medium
14690	56	109	To Do	Medium
14691	56	111	Work In Progress	Medium
14692	56	106	Completed	Medium
14693	56	112	Work In Progress	Medium
14694	56	117	To Do	Medium
14695	56	116	Under Review	Medium
14696	56	108	To Do	Medium
14697	56	105	Work In Progress	Medium
14698	56	107	To Do	Medium
14699	56	110	To Do	Medium
14700	56	113	To Do	Medium
14701	56	114	To Do	Medium
14702	56	103	To Do	Medium
14703	56	104	To Do	Medium
14704	56	102	To Do	Medium
15029	57	120	To Do	Medium
15030	57	124	To Do	Medium
15031	57	119	To Do	Medium
15032	57	122	Work In Progress	Medium
15033	57	123	To Do	Medium
15034	57	121	To Do	Medium
15035	57	118	Work In Progress	Medium
15036	57	101	To Do	Medium
15037	57	115	To Do	Medium
15038	57	109	To Do	Medium
15039	57	111	Work In Progress	Medium
15040	57	106	Completed	Medium
15041	57	112	Work In Progress	Medium
15042	57	117	To Do	Medium
15043	57	116	Under Review	Medium
15044	57	108	To Do	Medium
15045	57	105	Work In Progress	Medium
15046	57	107	To Do	Medium
15047	57	110	To Do	Medium
15048	57	113	To Do	Medium
15049	57	114	To Do	Medium
15050	57	103	To Do	Medium
15051	57	104	To Do	Medium
15052	57	102	To Do	Medium
15053	58	120	To Do	Medium
15054	58	124	To Do	Medium
15055	58	119	To Do	Medium
15056	58	122	Work In Progress	Medium
15057	58	123	To Do	Medium
15058	58	121	To Do	Medium
15059	58	118	Work In Progress	Medium
15060	58	101	To Do	Medium
15061	58	115	To Do	Medium
15062	58	109	To Do	Medium
15063	58	111	Work In Progress	Medium
15064	58	106	Completed	Medium
15065	58	112	Work In Progress	Medium
15066	58	117	To Do	Medium
15067	58	116	Under Review	Medium
15068	58	108	To Do	Medium
15069	58	105	Work In Progress	Medium
15070	58	107	To Do	Medium
15071	58	110	To Do	Medium
15072	58	113	To Do	Medium
15073	58	114	To Do	Medium
15074	58	103	To Do	Medium
15075	58	104	To Do	Medium
15076	58	102	To Do	Medium
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1198a1e9-844c-409f-af15-68aeb63bb8b1	50eec1202aff7309ab2818c0fef86f30f7ad465fea54047c15fd9eb95e0ad5f4	2025-01-27 20:38:01.054104-05	20240804190443_init	\N	\N	2025-01-27 20:38:01.022413-05	1
249c3c4f-c0d0-49ff-847e-2a231ca68050	5a898e1142646eacfb16b10b6fca7b2ac219e03bdd3eb096d9774cbb5d4d357d	2025-01-27 20:38:01.056055-05	20241102044343_add_first_last_name	\N	\N	2025-01-27 20:38:01.054716-05	1
a560b3de-0147-470d-95c4-027429a30a8c	c56bc4df965988dba4e7f51b5e189e92aa118e432410c2a400d10c7f25ca5842	2025-01-27 20:38:01.059814-05	20241125005750_add_user_tasks_table	\N	\N	2025-01-27 20:38:01.056613-05	1
21395cc5-6c5b-40c7-835c-44e570d29342	ab1152473551c4b8fdd777b0a43da61fd3d88626a8f2b1ca95970c9ec0ce931c	2025-01-27 20:38:01.06095-05	20241125103433_add_selected_track_to_user	\N	\N	2025-01-27 20:38:01.06033-05	1
3a279e97-341f-41bb-a5e8-eb08c416e3bb	0c03e3b165b5d74dff49dd8a7ddb2230e7d1c39c3a0cd443a1c13c19a8bf3643	2025-01-27 20:38:01.062124-05	20250104233334_add_created_at_field	\N	\N	2025-01-27 20:38:01.061295-05	1
09b96c04-fdb2-46f4-92ad-d69b0266aed2	ec5d511e20f861b1f6795dfa926281b211c969cb37f52d5009f427fb09aab787	2025-01-27 20:38:01.546322-05	20250128013801_add_user_school_table	\N	\N	2025-01-27 20:38:01.542625-05	1
e2d2eb77-1117-49a0-a102-cebc735ba46c	50eec1202aff7309ab2818c0fef86f30f7ad465fea54047c15fd9eb95e0ad5f4	2024-11-22 16:19:31.600838-05	20240804190443_init	\N	\N	2024-11-22 16:19:31.566424-05	1
464747e8-34c5-4f58-bd37-0896697fa520	5a898e1142646eacfb16b10b6fca7b2ac219e03bdd3eb096d9774cbb5d4d357d	2024-11-22 16:19:31.621768-05	20241122091635_init	\N	\N	2024-11-22 16:19:31.605867-05	1
b75c0ea7-cd3e-4fe4-9815-ca41aa2951f2	5a898e1142646eacfb16b10b6fca7b2ac219e03bdd3eb096d9774cbb5d4d357d	\N	20241102044343_add_first_last_name	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20241102044343_add_first_last_name\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "email" of relation "User" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"email\\" of relation \\"User\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7276), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20241102044343_add_first_last_name"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20241102044343_add_first_last_name"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	2024-11-25 08:39:27.33853-05	2024-11-25 08:35:08.344497-05	0
35ec9cb0-0680-4398-adc4-f74943613a56	5a898e1142646eacfb16b10b6fca7b2ac219e03bdd3eb096d9774cbb5d4d357d	2024-11-25 08:39:27.347951-05	20241102044343_add_first_last_name		\N	2024-11-25 08:39:27.347951-05	0
eafb0922-28ef-477e-ab19-0962a6b32abe	c56bc4df965988dba4e7f51b5e189e92aa118e432410c2a400d10c7f25ca5842	2024-11-25 08:39:49.030554-05	20241125005750_add_user_tasks_table	\N	\N	2024-11-25 08:39:49.012314-05	1
8a7b6e1f-b35d-4970-abe6-2788efa2c485	ab1152473551c4b8fdd777b0a43da61fd3d88626a8f2b1ca95970c9ec0ce931c	2024-11-25 08:39:49.037196-05	20241125103433_add_selected_track_to_user	\N	\N	2024-11-25 08:39:49.031643-05	1
\.


--
-- Name: Attachment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Attachment_id_seq"', 1, false);


--
-- Name: Comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Comment_id_seq"', 1, false);


--
-- Name: ProjectTeam_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProjectTeam_id_seq"', 1, false);


--
-- Name: Project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Project_id_seq"', 22, true);


--
-- Name: TaskAssignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TaskAssignment_id_seq"', 1, false);


--
-- Name: Task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Task_id_seq"', 12, true);


--
-- Name: Team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Team_id_seq"', 5, true);


--
-- Name: UserTasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserTasks_id_seq"', 15124, true);


--
-- Name: User_userId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_userId_seq"', 59, true);


--
-- Name: Attachment Attachment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: ProjectTeam ProjectTeam_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectTeam"
    ADD CONSTRAINT "ProjectTeam_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: TaskAssignment TaskAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment"
    ADD CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: Team Team_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_pkey" PRIMARY KEY (id);


--
-- Name: UserTasks UserTasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserTasks"
    ADD CONSTRAINT "UserTasks_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userId");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: UserTasks_userId_taskId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserTasks_userId_taskId_key" ON public."UserTasks" USING btree ("userId", "taskId");


--
-- Name: User_cognitoId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_cognitoId_key" ON public."User" USING btree ("cognitoId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Attachment Attachment_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Attachment Attachment_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Comment Comment_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Comment Comment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectTeam ProjectTeam_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectTeam"
    ADD CONSTRAINT "ProjectTeam_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectTeam ProjectTeam_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectTeam"
    ADD CONSTRAINT "ProjectTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Project Project_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TaskAssignment TaskAssignment_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment"
    ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TaskAssignment TaskAssignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment"
    ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_assignedUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_authorUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserTasks UserTasks_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserTasks"
    ADD CONSTRAINT "UserTasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserTasks UserTasks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserTasks"
    ADD CONSTRAINT "UserTasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

