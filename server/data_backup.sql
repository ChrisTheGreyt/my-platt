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
    "endDate" timestamp(3) without time zone
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
-- Name: SchoolTasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SchoolTasks" (
    id integer NOT NULL,
    "schoolId" integer NOT NULL,
    "taskType" text NOT NULL,
    "isRequired" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SchoolTasks" OWNER TO postgres;

--
-- Name: SchoolTasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SchoolTasks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SchoolTasks_id_seq" OWNER TO postgres;

--
-- Name: SchoolTasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SchoolTasks_id_seq" OWNED BY public."SchoolTasks".id;


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
-- Name: UserSchool; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserSchool" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    school text NOT NULL,
    "isSelected" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."UserSchool" OWNER TO postgres;

--
-- Name: UserSchool_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserSchool_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserSchool_id_seq" OWNER TO postgres;

--
-- Name: UserSchool_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserSchool_id_seq" OWNED BY public."UserSchool".id;


--
-- Name: UserTasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserTasks" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "taskId" integer NOT NULL,
    status text DEFAULT 'To Do'::text NOT NULL,
    priority text DEFAULT 'Medium'::text NOT NULL,
    "schoolTaskId" integer
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
-- Name: law_schools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.law_schools (
    id integer NOT NULL,
    school text,
    personal_statement text,
    diversity_statement text,
    optional_statement_prompt text,
    letters_of_recommendation text,
    resume text,
    extras_addenda text,
    application_fee text,
    interviews text,
    note text
);


ALTER TABLE public.law_schools OWNER TO postgres;

--
-- Name: law_schools_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.law_schools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.law_schools_id_seq OWNER TO postgres;

--
-- Name: law_schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.law_schools_id_seq OWNED BY public.law_schools.id;


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
-- Name: SchoolTasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SchoolTasks" ALTER COLUMN id SET DEFAULT nextval('public."SchoolTasks_id_seq"'::regclass);


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
-- Name: UserSchool id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSchool" ALTER COLUMN id SET DEFAULT nextval('public."UserSchool_id_seq"'::regclass);


--
-- Name: UserTasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserTasks" ALTER COLUMN id SET DEFAULT nextval('public."UserTasks_id_seq"'::regclass);


--
-- Name: law_schools id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.law_schools ALTER COLUMN id SET DEFAULT nextval('public.law_schools_id_seq'::regclass);


--
-- Data for Name: Attachment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Attachment" (id, "fileURL", "fileName", "taskId", "uploadedById") FROM stdin;
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Comment" (id, text, "taskId", "userId") FROM stdin;
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Project" (id, name, description, "startDate", "endDate") FROM stdin;
\.


--
-- Data for Name: ProjectTeam; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectTeam" (id, "teamId", "projectId") FROM stdin;
\.


--
-- Data for Name: SchoolTasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SchoolTasks" (id, "schoolId", "taskType", "isRequired", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Task" (id, title, description, status, priority, tags, "startDate", "dueDate", points, "projectId", "authorUserId", "assignedUserId") FROM stdin;
\.


--
-- Data for Name: TaskAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TaskAssignment" (id, "userId", "taskId") FROM stdin;
\.


--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Team" (id, "teamName", "productOwnerUserId", "projectManagerUserId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" ("userId", "cognitoId", username, "profilePictureUrl", "teamId", email, "firstName", "lastName", "subscriptionStatus", "selectedTrack", "createdAt") FROM stdin;
\.


--
-- Data for Name: UserSchool; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserSchool" (id, "userId", school, "isSelected") FROM stdin;
\.


--
-- Data for Name: UserTasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserTasks" (id, "userId", "taskId", status, priority, "schoolTaskId") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1a08ec0c-6d23-408c-bf66-8e69b3ddf851	50eec1202aff7309ab2818c0fef86f30f7ad465fea54047c15fd9eb95e0ad5f4	2025-01-30 19:32:49.168683-05	20240804190443_init	\N	\N	2025-01-30 19:32:49.145784-05	1
6cb3b464-6ce8-4fa8-bab6-5aaca341638f	5a898e1142646eacfb16b10b6fca7b2ac219e03bdd3eb096d9774cbb5d4d357d	2025-01-30 19:32:49.170445-05	20241102044343_add_first_last_name	\N	\N	2025-01-30 19:32:49.169263-05	1
7898a3ce-b2f3-47fc-b321-b5a82f6afb7e	c56bc4df965988dba4e7f51b5e189e92aa118e432410c2a400d10c7f25ca5842	2025-01-30 19:32:49.173675-05	20241125005750_add_user_tasks_table	\N	\N	2025-01-30 19:32:49.170942-05	1
77e7e83d-a22c-4478-a50d-ba4a66fb49cf	ab1152473551c4b8fdd777b0a43da61fd3d88626a8f2b1ca95970c9ec0ce931c	2025-01-30 19:32:49.174789-05	20241125103433_add_selected_track_to_user	\N	\N	2025-01-30 19:32:49.17417-05	1
8dc95719-2428-4edd-a016-1161a4a45501	0c03e3b165b5d74dff49dd8a7ddb2230e7d1c39c3a0cd443a1c13c19a8bf3643	2025-01-30 19:32:49.17586-05	20250104233334_add_created_at_field	\N	\N	2025-01-30 19:32:49.175231-05	1
9e13d6ba-f047-404e-bfd5-f6af3a9373c5	ec5d511e20f861b1f6795dfa926281b211c969cb37f52d5009f427fb09aab787	2025-01-30 19:32:49.177591-05	20250128013801_add_user_school_table	\N	\N	2025-01-30 19:32:49.176316-05	1
0fba5740-593a-499c-9b9f-f961219d3aff	489e93fff60ea76a5006ed9227a5905e6b59f81c3551eac6442584d8f07102df	2025-01-30 19:32:49.181506-05	20250128041622_reconcile_migrations	\N	\N	2025-01-30 19:32:49.17808-05	1
5ae0eab8-a078-46ed-950b-457d8920a842	17ee34c3fd0cb314ce1f875668e599b0534325c74f51e3ba63c4e1d937de4044	2025-01-30 19:32:49.182816-05	20250129210218_add_is_selected_to_user_school	\N	\N	2025-01-30 19:32:49.181972-05	1
6680155f-31eb-4d6e-b702-b343b5ddc38c	1e111d557b561017787fbcf65d3c35491b940ec48016310e534c4c4ad6195cfe	2025-01-30 19:32:49.186758-05	20250131003201_add_school_tasks_initial	\N	\N	2025-01-30 19:32:49.183286-05	1
b1312139-0fcc-4c80-b979-2f0d2cac3b44	e38287c4e872c956e6fa047bf25771b6db6239e99d62ff61328446aca63b711f	2025-01-30 19:32:51.479793-05	20250131003251_add_school_tasks_with_relations	\N	\N	2025-01-30 19:32:51.475948-05	1
\.


--
-- Data for Name: law_schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.law_schools (id, school, personal_statement, diversity_statement, optional_statement_prompt, letters_of_recommendation, resume, extras_addenda, application_fee, interviews, note) FROM stdin;
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

SELECT pg_catalog.setval('public."Project_id_seq"', 1, false);


--
-- Name: SchoolTasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SchoolTasks_id_seq"', 1, false);


--
-- Name: TaskAssignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TaskAssignment_id_seq"', 1, false);


--
-- Name: Task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Task_id_seq"', 1, false);


--
-- Name: Team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Team_id_seq"', 1, false);


--
-- Name: UserSchool_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserSchool_id_seq"', 1, false);


--
-- Name: UserTasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserTasks_id_seq"', 1, false);


--
-- Name: User_userId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_userId_seq"', 1, false);


--
-- Name: law_schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.law_schools_id_seq', 1, false);


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
-- Name: SchoolTasks SchoolTasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SchoolTasks"
    ADD CONSTRAINT "SchoolTasks_pkey" PRIMARY KEY (id);


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
-- Name: UserSchool UserSchool_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSchool"
    ADD CONSTRAINT "UserSchool_pkey" PRIMARY KEY (id);


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
-- Name: law_schools law_schools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.law_schools
    ADD CONSTRAINT law_schools_pkey PRIMARY KEY (id);


--
-- Name: SchoolTasks_schoolId_taskType_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SchoolTasks_schoolId_taskType_key" ON public."SchoolTasks" USING btree ("schoolId", "taskType");


--
-- Name: UserSchool_userId_school_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserSchool_userId_school_key" ON public."UserSchool" USING btree ("userId", school);


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
-- Name: law_schools_school_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX law_schools_school_key ON public.law_schools USING btree (school);


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
-- Name: SchoolTasks SchoolTasks_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SchoolTasks"
    ADD CONSTRAINT "SchoolTasks_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.law_schools(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: UserSchool UserSchool_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSchool"
    ADD CONSTRAINT "UserSchool_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserTasks UserTasks_schoolTaskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserTasks"
    ADD CONSTRAINT "UserTasks_schoolTaskId_fkey" FOREIGN KEY ("schoolTaskId") REFERENCES public."SchoolTasks"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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

