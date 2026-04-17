--




--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;




--
-- Name: academic_years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.academic_years (
    id bigint NOT NULL,
    label character varying(20) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_current boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: academic_years_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.academic_years_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: academic_years_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.academic_years_id_seq OWNED BY public.academic_years.id;


--
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_notifications (
    id bigint NOT NULL,
    recipient_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    body text NOT NULL,
    priority character varying(10) DEFAULT 'normal'::character varying NOT NULL,
    category character varying(20) DEFAULT 'system'::character varying NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_notifications_id_seq OWNED BY public.admin_notifications.id;


--
-- Name: admission_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admission_applications (
    id bigint NOT NULL,
    application_id character varying(20) NOT NULL,
    applicant_name character varying(120) NOT NULL,
    applicant_email character varying(254) NOT NULL,
    applicant_phone character varying(20) DEFAULT ''::character varying NOT NULL,
    date_of_birth date,
    grade_applying_id bigint,
    program character varying(100) DEFAULT ''::character varying NOT NULL,
    guardian_name character varying(120) DEFAULT ''::character varying NOT NULL,
    guardian_phone character varying(20) DEFAULT ''::character varying NOT NULL,
    guardian_email character varying(254) DEFAULT ''::character varying NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    reviewed_by_id bigint,
    student_created_id bigint,
    applied_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admission_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admission_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admission_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admission_applications_id_seq OWNED BY public.admission_applications.id;


--
-- Name: admission_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admission_documents (
    id bigint NOT NULL,
    application_id bigint NOT NULL,
    doc_type character varying(30) NOT NULL,
    file character varying(100) NOT NULL,
    file_name character varying(200) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    verified_at timestamp with time zone,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admission_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admission_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admission_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admission_documents_id_seq OWNED BY public.admission_documents.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id bigint NOT NULL,
    title character varying(200) NOT NULL,
    body text NOT NULL,
    target_role character varying(20) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    created_by_id bigint
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.announcements ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.announcements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assessment_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_questions (
    id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    question_id bigint NOT NULL,
    "order" smallint DEFAULT 0 NOT NULL,
    CONSTRAINT assessment_questions_order_check CHECK (("order" >= 0))
);


--
-- Name: assessment_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessment_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessment_questions_id_seq OWNED BY public.assessment_questions.id;


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments (
    id bigint NOT NULL,
    title character varying(200) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    course_id bigint NOT NULL,
    teacher_id bigint NOT NULL,
    subject_id bigint NOT NULL,
    total_marks integer DEFAULT 100 NOT NULL,
    scheduled_date timestamp with time zone,
    duration_minutes integer DEFAULT 60 NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    shuffle_questions boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessments_duration_minutes_check CHECK ((duration_minutes >= 0)),
    CONSTRAINT assessments_total_marks_check CHECK ((total_marks >= 0))
);


--
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignments (
    id bigint NOT NULL,
    title character varying(200) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    course_id bigint NOT NULL,
    teacher_id bigint NOT NULL,
    due_date timestamp with time zone NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    date date NOT NULL,
    is_present boolean DEFAULT true NOT NULL,
    remarks character varying(200) DEFAULT ''::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    action character varying(30) NOT NULL,
    detail text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    actor_id bigint,
    target_user_id bigint
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_group_id_seq OWNED BY public.auth_group.id;


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_permission_id_seq OWNED BY public.auth_permission.id;


--
-- Name: certificate_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificate_templates (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    cert_type character varying(20) NOT NULL,
    body_template text NOT NULL,
    header_image character varying(100) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: certificate_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.certificate_templates ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.certificate_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id bigint NOT NULL,
    category character varying(20) DEFAULT 'internal'::character varying NOT NULL,
    subject character varying(200) DEFAULT ''::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: conversations_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations_participants (
    id bigint NOT NULL,
    conversation_id bigint NOT NULL,
    user_id bigint NOT NULL
);


--
-- Name: conversations_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_participants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_participants_id_seq OWNED BY public.conversations_participants.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id bigint NOT NULL,
    subject_id bigint NOT NULL,
    section_id bigint NOT NULL,
    teacher_id bigint,
    academic_year_id bigint NOT NULL,
    location character varying(60) DEFAULT ''::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.courses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    code character varying(20) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone DEFAULT now() NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text DEFAULT ''::text NOT NULL,
    content_type_id integer,
    user_id bigint NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.django_admin_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.django_admin_log_id_seq OWNED BY public.django_admin_log.id;


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.django_content_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: django_content_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.django_content_type_id_seq OWNED BY public.django_content_type.id;


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: django_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.django_migrations_id_seq OWNED BY public.django_migrations.id;


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


--
-- Name: extracurricular_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.extracurricular_activities (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    name character varying(120) NOT NULL,
    role character varying(60) DEFAULT ''::character varying NOT NULL,
    schedule character varying(60) DEFAULT ''::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: extracurricular_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.extracurricular_activities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: extracurricular_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.extracurricular_activities_id_seq OWNED BY public.extracurricular_activities.id;


--
-- Name: fee_template_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_template_items (
    id bigint NOT NULL,
    description character varying(200) NOT NULL,
    amount numeric(10,2) NOT NULL,
    is_optional boolean NOT NULL,
    "order" smallint NOT NULL,
    template_id bigint NOT NULL,
    CONSTRAINT fee_template_items_order_check CHECK (("order" >= 0))
);


--
-- Name: fee_template_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.fee_template_items ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.fee_template_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: fee_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_templates (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    due_date date,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    academic_year_id bigint NOT NULL,
    grade_id bigint NOT NULL
);


--
-- Name: fee_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.fee_templates ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.fee_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: generated_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generated_questions (
    id bigint NOT NULL,
    source_document_id bigint,
    reference_id character varying(30) NOT NULL,
    question_text text NOT NULL,
    key_answer text DEFAULT ''::text NOT NULL,
    topic character varying(120) NOT NULL,
    subject_id bigint NOT NULL,
    marks smallint DEFAULT 2 NOT NULL,
    difficulty character varying(10) DEFAULT 'medium'::character varying NOT NULL,
    grading_rubric jsonb DEFAULT '{}'::jsonb NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    approved_by_id bigint,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT generated_questions_marks_check CHECK ((marks >= 0))
);


--
-- Name: generated_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.generated_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: generated_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.generated_questions_id_seq OWNED BY public.generated_questions.id;


--
-- Name: generated_report_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generated_report_cards (
    id bigint NOT NULL,
    data_snapshot jsonb NOT NULL,
    status character varying(20) NOT NULL,
    generated_at timestamp with time zone NOT NULL,
    academic_year_id bigint NOT NULL,
    generated_by_id bigint,
    student_id bigint NOT NULL,
    template_id bigint NOT NULL,
    term_id bigint NOT NULL
);


--
-- Name: generated_report_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.generated_report_cards ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.generated_report_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: grade_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grade_entries (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    marks_obtained numeric(6,2) NOT NULL,
    letter_grade character varying(5) DEFAULT ''::character varying NOT NULL,
    remarks text DEFAULT ''::text NOT NULL,
    graded_by_id bigint,
    graded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grade_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grade_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grade_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grade_entries_id_seq OWNED BY public.grade_entries.id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id bigint NOT NULL,
    level smallint NOT NULL,
    label character varying(30) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT grades_level_check CHECK ((level >= 0))
);


--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grades_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: guardians; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guardians (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    relationship character varying(30) DEFAULT 'parent'::character varying NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email character varying(254) NOT NULL,
    name character varying(120) NOT NULL,
    phone character varying(20) NOT NULL
);


--
-- Name: guardians_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.guardians_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: guardians_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.guardians_id_seq OWNED BY public.guardians.id;


--
-- Name: health_observations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_observations (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    teacher_id bigint NOT NULL,
    observation text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: health_observations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.health_observations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: health_observations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.health_observations_id_seq OWNED BY public.health_observations.id;


--
-- Name: health_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_records (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    height_cm numeric(5,1),
    weight_kg numeric(5,1),
    notes text DEFAULT ''::text NOT NULL,
    check_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: health_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.health_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: health_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.health_records_id_seq OWNED BY public.health_records.id;


--
-- Name: id_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.id_configurations (
    id bigint NOT NULL,
    role character varying(20) NOT NULL,
    prefix character varying(3) NOT NULL,
    year character varying(4) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: id_configurations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.id_configurations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.id_configurations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: institution_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institution_events (
    id bigint NOT NULL,
    title character varying(200) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    event_date timestamp with time zone NOT NULL,
    location character varying(120) DEFAULT ''::character varying NOT NULL,
    photo character varying(100) DEFAULT ''::character varying NOT NULL,
    photo_count integer DEFAULT 0 NOT NULL,
    created_by_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT institution_events_photo_count_check CHECK ((photo_count >= 0))
);


--
-- Name: institution_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.institution_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: institution_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.institution_events_id_seq OWNED BY public.institution_events.id;


--
-- Name: issued_certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.issued_certificates (
    id bigint NOT NULL,
    serial_number character varying(30) NOT NULL,
    issued_date date NOT NULL,
    reason text NOT NULL,
    date_of_admission date,
    date_of_leaving date,
    class_at_leaving character varying(30) NOT NULL,
    reason_for_leaving character varying(100) NOT NULL,
    conduct character varying(100) NOT NULL,
    qualified_for_promotion boolean,
    working_days integer,
    days_present integer,
    rendered_body text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    issued_by_id bigint,
    student_id bigint NOT NULL,
    template_id bigint NOT NULL
);


--
-- Name: issued_certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.issued_certificates ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.issued_certificates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: leave_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_applications (
    id bigint NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_half_day boolean NOT NULL,
    reason text NOT NULL,
    attachment character varying(100) NOT NULL,
    status character varying(10) NOT NULL,
    applied_at timestamp with time zone NOT NULL,
    applicant_id bigint NOT NULL,
    leave_type_id bigint NOT NULL
);


--
-- Name: leave_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.leave_applications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.leave_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: leave_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_approvals (
    id bigint NOT NULL,
    action character varying(10) NOT NULL,
    remarks text NOT NULL,
    acted_at timestamp with time zone NOT NULL,
    application_id bigint NOT NULL,
    approver_id bigint NOT NULL
);


--
-- Name: leave_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.leave_approvals ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.leave_approvals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_balances (
    id bigint NOT NULL,
    allocated integer NOT NULL,
    used numeric(5,1) NOT NULL,
    carried_forward numeric(5,1) NOT NULL,
    academic_year_id bigint NOT NULL,
    user_id bigint NOT NULL,
    leave_type_id bigint NOT NULL
);


--
-- Name: leave_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.leave_balances ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.leave_balances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_types (
    id bigint NOT NULL,
    name character varying(60) NOT NULL,
    code character varying(10) NOT NULL,
    annual_quota integer NOT NULL,
    carries_forward boolean NOT NULL,
    applicable_to character varying(10) NOT NULL,
    is_active boolean NOT NULL
);


--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.leave_types ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.leave_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    conversation_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    body text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    attachment character varying(100) DEFAULT ''::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: otps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otps (
    id bigint NOT NULL,
    email character varying(254) NOT NULL,
    code character varying(6) NOT NULL,
    purpose character varying(20) NOT NULL,
    attempts smallint NOT NULL,
    is_used boolean NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    phone character varying(20) NOT NULL,
    CONSTRAINT otps_attempts_check CHECK ((attempts >= 0))
);


--
-- Name: otps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.otps ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.otps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id bigint NOT NULL,
    method_type character varying(20) NOT NULL,
    display_name character varying(60) NOT NULL,
    last_four character varying(4) DEFAULT ''::character varying NOT NULL,
    expiry character varying(7) DEFAULT ''::character varying NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id bigint NOT NULL
);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_methods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    account_id bigint NOT NULL,
    receipt_id character varying(30) NOT NULL,
    amount numeric(10,2) NOT NULL,
    method character varying(20) NOT NULL,
    paid_by_id bigint,
    paid_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    razorpay_order_id character varying(64),
    razorpay_payment_id character varying(64) NOT NULL,
    razorpay_signature character varying(256) NOT NULL,
    gateway_status character varying(20) NOT NULL
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: payroll_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payroll_runs (
    id bigint NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    status character varying(20) NOT NULL,
    processed_at timestamp with time zone,
    total_gross numeric(12,2) NOT NULL,
    total_deductions numeric(12,2) NOT NULL,
    total_net numeric(12,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    academic_year_id bigint NOT NULL,
    processed_by_id bigint
);


--
-- Name: payroll_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.payroll_runs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.payroll_runs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payslip_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payslip_entries (
    id bigint NOT NULL,
    basic numeric(10,2) NOT NULL,
    hra numeric(10,2) NOT NULL,
    da numeric(10,2) NOT NULL,
    conveyance numeric(10,2) NOT NULL,
    medical numeric(10,2) NOT NULL,
    special_allowance numeric(10,2) NOT NULL,
    gross_salary numeric(10,2) NOT NULL,
    pf_employee numeric(10,2) NOT NULL,
    pf_employer numeric(10,2) NOT NULL,
    esi_employee numeric(10,2) NOT NULL,
    esi_employer numeric(10,2) NOT NULL,
    professional_tax numeric(10,2) NOT NULL,
    tds numeric(10,2) NOT NULL,
    total_deductions numeric(10,2) NOT NULL,
    net_salary numeric(10,2) NOT NULL,
    working_days integer NOT NULL,
    days_present integer NOT NULL,
    days_absent integer NOT NULL,
    leave_deduction numeric(10,2) NOT NULL,
    bonus numeric(10,2) NOT NULL,
    arrears numeric(10,2) NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    payroll_run_id bigint NOT NULL,
    staff_id bigint NOT NULL
);


--
-- Name: payslip_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.payslip_entries ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.payslip_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: principal_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.principal_profiles (
    id bigint NOT NULL,
    employee_id character varying(20) NOT NULL,
    title character varying(60) NOT NULL,
    qualification character varying(200) NOT NULL,
    specialization character varying(200) NOT NULL,
    date_joined date,
    employment_status character varying(20) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    department_id bigint,
    user_id bigint NOT NULL
);


--
-- Name: principal_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.principal_profiles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.principal_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: report_card_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_card_templates (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    board_type character varying(20) NOT NULL,
    grading_scale character varying(10) NOT NULL,
    co_scholastic_areas jsonb NOT NULL,
    show_attendance boolean NOT NULL,
    show_remarks boolean NOT NULL,
    show_rank boolean NOT NULL,
    header_text text NOT NULL,
    footer_text text NOT NULL,
    principal_signature character varying(100) NOT NULL,
    school_seal character varying(100) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    academic_year_id bigint NOT NULL,
    grade_id bigint NOT NULL
);


--
-- Name: report_card_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.report_card_templates ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.report_card_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: report_card_terms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_card_terms (
    id bigint NOT NULL,
    term character varying(20) NOT NULL,
    grade_thresholds jsonb NOT NULL,
    template_id bigint NOT NULL
);


--
-- Name: report_card_terms_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_card_terms_assessments (
    id bigint NOT NULL,
    reportcardterm_id bigint NOT NULL,
    assessment_id bigint NOT NULL
);


--
-- Name: report_card_terms_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.report_card_terms_assessments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.report_card_terms_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: report_card_terms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.report_card_terms ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.report_card_terms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: salary_structures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salary_structures (
    id bigint NOT NULL,
    basic numeric(10,2) NOT NULL,
    hra numeric(10,2) NOT NULL,
    da numeric(10,2) NOT NULL,
    conveyance numeric(10,2) NOT NULL,
    medical numeric(10,2) NOT NULL,
    special_allowance numeric(10,2) NOT NULL,
    pf_employee_pct numeric(4,2) NOT NULL,
    pf_employer_pct numeric(4,2) NOT NULL,
    esi_employee_pct numeric(4,2) NOT NULL,
    esi_employer_pct numeric(4,2) NOT NULL,
    professional_tax numeric(8,2) NOT NULL,
    tds_pct numeric(4,2) NOT NULL,
    effective_from date NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    user_id bigint NOT NULL
);


--
-- Name: salary_structures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.salary_structures ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.salary_structures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schedule_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_slots (
    id bigint NOT NULL,
    course_id bigint NOT NULL,
    day integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    location character varying(60) DEFAULT ''::character varying NOT NULL
);


--
-- Name: schedule_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schedule_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schedule_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schedule_slots_id_seq OWNED BY public.schedule_slots.id;


--
-- Name: school_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_settings (
    id bigint NOT NULL,
    school_name character varying(200) NOT NULL,
    logo character varying(100) NOT NULL,
    address text NOT NULL,
    phone character varying(30) NOT NULL,
    email character varying(254) NOT NULL,
    website character varying(200) NOT NULL,
    timezone character varying(60) NOT NULL,
    currency character varying(10) NOT NULL,
    motto character varying(200) NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: school_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.school_settings ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.school_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sections (
    id bigint NOT NULL,
    grade_id bigint NOT NULL,
    name character varying(10) NOT NULL,
    capacity integer DEFAULT 40 NOT NULL,
    academic_year_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sections_capacity_check CHECK ((capacity >= 0))
);


--
-- Name: sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sections_id_seq OWNED BY public.sections.id;


--
-- Name: source_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.source_documents (
    id bigint NOT NULL,
    uploaded_by_id bigint NOT NULL,
    file character varying(100) NOT NULL,
    file_name character varying(200) NOT NULL,
    file_size_bytes integer DEFAULT 0 NOT NULL,
    subject_context character varying(120) DEFAULT ''::character varying NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT source_documents_file_size_bytes_check CHECK ((file_size_bytes >= 0))
);


--
-- Name: source_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.source_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: source_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.source_documents_id_seq OWNED BY public.source_documents.id;


--
-- Name: staff_hr_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_hr_documents (
    id bigint NOT NULL,
    doc_type character varying(20) NOT NULL,
    file character varying(100) NOT NULL,
    file_name character varying(200) NOT NULL,
    uploaded_at timestamp with time zone NOT NULL,
    staff_id bigint NOT NULL
);


--
-- Name: staff_hr_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.staff_hr_documents ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.staff_hr_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: staff_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_profiles (
    id bigint NOT NULL,
    employee_id character varying(20) NOT NULL,
    designation character varying(60) NOT NULL,
    date_of_joining date NOT NULL,
    date_of_leaving date,
    employment_type character varying(20) NOT NULL,
    bank_account_no character varying(20) NOT NULL,
    bank_name character varying(100) NOT NULL,
    ifsc_code character varying(11) NOT NULL,
    pan_number character varying(10) NOT NULL,
    aadhar_number character varying(12) NOT NULL,
    uan_number character varying(12) NOT NULL,
    esi_number character varying(17) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    department_id bigint,
    user_id bigint NOT NULL
);


--
-- Name: staff_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.staff_profiles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.staff_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: student_discounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_discounts (
    id bigint NOT NULL,
    discount_type character varying(20) NOT NULL,
    description character varying(200) NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    applied_by_id bigint,
    student_id bigint NOT NULL
);


--
-- Name: student_discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.student_discounts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.student_discounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: student_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_documents (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    doc_type character varying(30) NOT NULL,
    file character varying(100) NOT NULL,
    file_name character varying(200) NOT NULL,
    file_size_bytes integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    verified_at timestamp with time zone,
    verified_by_id bigint,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT student_documents_file_size_bytes_check CHECK ((file_size_bytes >= 0))
);


--
-- Name: student_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_documents_id_seq OWNED BY public.student_documents.id;


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    student_id character varying(20) NOT NULL,
    section_id bigint,
    house character varying(40) DEFAULT ''::character varying NOT NULL,
    date_of_birth date,
    address text DEFAULT ''::text NOT NULL,
    enrollment_date date DEFAULT CURRENT_DATE NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_profiles_id_seq OWNED BY public.student_profiles.id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    code character varying(20) NOT NULL,
    department_id bigint NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: teacher_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    employee_id character varying(20) NOT NULL,
    department_id bigint,
    title character varying(60) DEFAULT ''::character varying NOT NULL,
    qualification character varying(200) DEFAULT ''::character varying NOT NULL,
    specialization character varying(200) DEFAULT ''::character varying NOT NULL,
    date_joined date,
    salary numeric(10,2),
    employment_status character varying(20) DEFAULT 'full_time'::character varying NOT NULL,
    performance_score numeric(3,1),
    research_focus text DEFAULT ''::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: teacher_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_profiles_id_seq OWNED BY public.teacher_profiles.id;


--
-- Name: token_blacklist_blacklistedtoken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_blacklist_blacklistedtoken (
    id bigint NOT NULL,
    blacklisted_at timestamp with time zone DEFAULT now() NOT NULL,
    token_id bigint NOT NULL
);


--
-- Name: token_blacklist_blacklistedtoken_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.token_blacklist_blacklistedtoken_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: token_blacklist_blacklistedtoken_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.token_blacklist_blacklistedtoken_id_seq OWNED BY public.token_blacklist_blacklistedtoken.id;


--
-- Name: token_blacklist_outstandingtoken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_blacklist_outstandingtoken (
    id bigint NOT NULL,
    token text NOT NULL,
    created_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    user_id bigint,
    jti character varying(255) NOT NULL
);


--
-- Name: token_blacklist_outstandingtoken_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.token_blacklist_outstandingtoken_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: token_blacklist_outstandingtoken_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.token_blacklist_outstandingtoken_id_seq OWNED BY public.token_blacklist_outstandingtoken.id;


--
-- Name: tuition_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tuition_accounts (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    due_date date,
    semester character varying(40) DEFAULT ''::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tuition_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tuition_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tuition_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tuition_accounts_id_seq OWNED BY public.tuition_accounts.id;


--
-- Name: tuition_line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tuition_line_items (
    id bigint NOT NULL,
    account_id bigint NOT NULL,
    description character varying(200) NOT NULL,
    amount numeric(10,2) NOT NULL,
    credit_hours smallint,
    rate_per_hour numeric(8,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tuition_line_items_credit_hours_check CHECK ((credit_hours >= 0))
);


--
-- Name: tuition_line_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tuition_line_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tuition_line_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tuition_line_items_id_seq OWNED BY public.tuition_line_items.id;


--
-- Name: udise_annual_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.udise_annual_data (
    id bigint NOT NULL,
    enrollment_data jsonb NOT NULL,
    teacher_data jsonb NOT NULL,
    infrastructure jsonb NOT NULL,
    cwsn_count integer NOT NULL,
    rte_count integer NOT NULL,
    minority_count integer NOT NULL,
    mid_day_meal boolean NOT NULL,
    has_boundary_wall boolean NOT NULL,
    has_ramp boolean NOT NULL,
    status character varying(20) NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    academic_year_id bigint NOT NULL
);


--
-- Name: udise_annual_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.udise_annual_data ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.udise_annual_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: udise_export_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.udise_export_logs (
    id bigint NOT NULL,
    exported_at timestamp with time zone NOT NULL,
    format character varying(10) NOT NULL,
    record_count integer NOT NULL,
    academic_year_id bigint NOT NULL,
    exported_by_id bigint
);


--
-- Name: udise_export_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.udise_export_logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.udise_export_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: udise_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.udise_profile (
    id bigint NOT NULL,
    udise_code character varying(11) NOT NULL,
    block_code character varying(10) NOT NULL,
    district_code character varying(10) NOT NULL,
    state_code character varying(10) NOT NULL,
    school_category character varying(20) NOT NULL,
    school_type character varying(10) NOT NULL,
    management_type character varying(20) NOT NULL,
    medium character varying(60) NOT NULL,
    year_established integer NOT NULL,
    affiliation_board character varying(60) NOT NULL,
    affiliation_number character varying(30) NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: udise_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.udise_profile ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.udise_profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_tour_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tour_progress (
    id bigint NOT NULL,
    tour_key character varying(60) NOT NULL,
    completed_at timestamp with time zone NOT NULL,
    user_id bigint NOT NULL
);


--
-- Name: user_tour_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_tour_progress ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_tour_progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean DEFAULT false NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) DEFAULT ''::character varying NOT NULL,
    last_name character varying(150) DEFAULT ''::character varying NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    date_joined timestamp with time zone DEFAULT now() NOT NULL,
    role character varying(20) NOT NULL,
    phone character varying(20) DEFAULT ''::character varying NOT NULL,
    avatar character varying(100) DEFAULT ''::character varying NOT NULL
);


--
-- Name: users_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_groups (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    group_id integer NOT NULL
);


--
-- Name: users_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_groups_id_seq OWNED BY public.users_groups.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users_user_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_user_permissions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: users_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_permissions_id_seq OWNED BY public.users_user_permissions.id;


--
-- Name: academic_years id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years ALTER COLUMN id SET DEFAULT nextval('public.academic_years_id_seq'::regclass);


--
-- Name: admin_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications ALTER COLUMN id SET DEFAULT nextval('public.admin_notifications_id_seq'::regclass);


--
-- Name: admission_applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_applications ALTER COLUMN id SET DEFAULT nextval('public.admission_applications_id_seq'::regclass);


--
-- Name: admission_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_documents ALTER COLUMN id SET DEFAULT nextval('public.admission_documents_id_seq'::regclass);


--
-- Name: assessment_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions ALTER COLUMN id SET DEFAULT nextval('public.assessment_questions_id_seq'::regclass);


--
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);


--
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: auth_group id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group ALTER COLUMN id SET DEFAULT nextval('public.auth_group_id_seq'::regclass);


--
-- Name: auth_permission id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_permission ALTER COLUMN id SET DEFAULT nextval('public.auth_permission_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: conversations_participants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations_participants ALTER COLUMN id SET DEFAULT nextval('public.conversations_participants_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: django_admin_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_admin_log ALTER COLUMN id SET DEFAULT nextval('public.django_admin_log_id_seq'::regclass);


--
-- Name: django_content_type id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_content_type ALTER COLUMN id SET DEFAULT nextval('public.django_content_type_id_seq'::regclass);


--
-- Name: django_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_migrations ALTER COLUMN id SET DEFAULT nextval('public.django_migrations_id_seq'::regclass);


--
-- Name: extracurricular_activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extracurricular_activities ALTER COLUMN id SET DEFAULT nextval('public.extracurricular_activities_id_seq'::regclass);


--
-- Name: generated_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_questions ALTER COLUMN id SET DEFAULT nextval('public.generated_questions_id_seq'::regclass);


--
-- Name: grade_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_entries ALTER COLUMN id SET DEFAULT nextval('public.grade_entries_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: guardians id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guardians ALTER COLUMN id SET DEFAULT nextval('public.guardians_id_seq'::regclass);


--
-- Name: health_observations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_observations ALTER COLUMN id SET DEFAULT nextval('public.health_observations_id_seq'::regclass);


--
-- Name: health_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_records ALTER COLUMN id SET DEFAULT nextval('public.health_records_id_seq'::regclass);


--
-- Name: institution_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institution_events ALTER COLUMN id SET DEFAULT nextval('public.institution_events_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: schedule_slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_slots ALTER COLUMN id SET DEFAULT nextval('public.schedule_slots_id_seq'::regclass);


--
-- Name: sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections ALTER COLUMN id SET DEFAULT nextval('public.sections_id_seq'::regclass);


--
-- Name: source_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_documents ALTER COLUMN id SET DEFAULT nextval('public.source_documents_id_seq'::regclass);


--
-- Name: student_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_documents ALTER COLUMN id SET DEFAULT nextval('public.student_documents_id_seq'::regclass);


--
-- Name: student_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles ALTER COLUMN id SET DEFAULT nextval('public.student_profiles_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: teacher_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_profiles ALTER COLUMN id SET DEFAULT nextval('public.teacher_profiles_id_seq'::regclass);


--
-- Name: token_blacklist_blacklistedtoken id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_blacklist_blacklistedtoken ALTER COLUMN id SET DEFAULT nextval('public.token_blacklist_blacklistedtoken_id_seq'::regclass);


--
-- Name: token_blacklist_outstandingtoken id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_blacklist_outstandingtoken ALTER COLUMN id SET DEFAULT nextval('public.token_blacklist_outstandingtoken_id_seq'::regclass);


--
-- Name: tuition_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tuition_accounts ALTER COLUMN id SET DEFAULT nextval('public.tuition_accounts_id_seq'::regclass);


--
-- Name: tuition_line_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tuition_line_items ALTER COLUMN id SET DEFAULT nextval('public.tuition_line_items_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: users_groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_groups ALTER COLUMN id SET DEFAULT nextval('public.users_groups_id_seq'::regclass);


--
-- Name: users_user_permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_user_permissions ALTER COLUMN id SET DEFAULT nextval('public.users_user_permissions_id_seq'::regclass);


--
-- Name: academic_years academic_years_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT academic_years_label_key UNIQUE (label);


--
-- Name: academic_years academic_years_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT academic_years_pkey PRIMARY KEY (id);


--
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- Name: admission_applications admission_applications_application_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_applications
    ADD CONSTRAINT admission_applications_application_id_key UNIQUE (application_id);


--
-- Name: admission_applications admission_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_applications
    ADD CONSTRAINT admission_applications_pkey PRIMARY KEY (id);


--
-- Name: admission_documents admission_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_documents
    ADD CONSTRAINT admission_documents_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: assessment_questions assessment_questions_assessment_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_assessment_id_question_id_key UNIQUE (assessment_id, question_id);


--
-- Name: assessment_questions assessment_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_student_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_date_key UNIQUE (student_id, date);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: certificate_templates certificate_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate_templates
    ADD CONSTRAINT certificate_templates_pkey PRIMARY KEY (id);


--
-- Name: conversations_participants conversations_participants_conversation_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations_participants
    ADD CONSTRAINT conversations_participants_conversation_id_user_id_key UNIQUE (conversation_id, user_id);


--
-- Name: conversations_participants conversations_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations_participants
    ADD CONSTRAINT conversations_participants_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: courses courses_subject_id_section_id_academic_year_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_subject_id_section_id_academic_year_id_key UNIQUE (subject_id, section_id, academic_year_id);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_app_label_model_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_key UNIQUE (app_label, model);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: extracurricular_activities extracurricular_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extracurricular_activities
    ADD CONSTRAINT extracurricular_activities_pkey PRIMARY KEY (id);


--
-- Name: fee_template_items fee_template_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_template_items
    ADD CONSTRAINT fee_template_items_pkey PRIMARY KEY (id);


--
-- Name: fee_templates fee_templates_grade_id_academic_year_id_97a26ec1_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_templates
    ADD CONSTRAINT fee_templates_grade_id_academic_year_id_97a26ec1_uniq UNIQUE (grade_id, academic_year_id);


--
-- Name: fee_templates fee_templates_grade_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_templates
    ADD CONSTRAINT fee_templates_grade_id_key UNIQUE (grade_id);


--
-- Name: fee_templates fee_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_templates
    ADD CONSTRAINT fee_templates_pkey PRIMARY KEY (id);


--
-- Name: generated_questions generated_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_questions
    ADD CONSTRAINT generated_questions_pkey PRIMARY KEY (id);


--
-- Name: generated_questions generated_questions_reference_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_questions
    ADD CONSTRAINT generated_questions_reference_id_key UNIQUE (reference_id);


--
-- Name: generated_report_cards generated_report_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_report_cards
    ADD CONSTRAINT generated_report_cards_pkey PRIMARY KEY (id);


--
-- Name: generated_report_cards generated_report_cards_student_id_template_id_t_53840ebf_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_report_cards
    ADD CONSTRAINT generated_report_cards_student_id_template_id_t_53840ebf_uniq UNIQUE (student_id, template_id, term_id);


--
-- Name: grade_entries grade_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_entries
    ADD CONSTRAINT grade_entries_pkey PRIMARY KEY (id);


--
-- Name: grade_entries grade_entries_student_id_assessment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_entries
    ADD CONSTRAINT grade_entries_student_id_assessment_id_key UNIQUE (student_id, assessment_id);


--
-- Name: grades grades_level_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_level_key UNIQUE (level);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: guardians guardians_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guardians
    ADD CONSTRAINT guardians_pkey PRIMARY KEY (id);


--
-- Name: health_observations health_observations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_observations
    ADD CONSTRAINT health_observations_pkey PRIMARY KEY (id);


--
-- Name: health_records health_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_records
    ADD CONSTRAINT health_records_pkey PRIMARY KEY (id);


--
-- Name: id_configurations id_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.id_configurations
    ADD CONSTRAINT id_configurations_pkey PRIMARY KEY (id);


--
-- Name: id_configurations id_configurations_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.id_configurations
    ADD CONSTRAINT id_configurations_role_key UNIQUE (role);


--
-- Name: institution_events institution_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institution_events
    ADD CONSTRAINT institution_events_pkey PRIMARY KEY (id);


--
-- Name: issued_certificates issued_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_pkey PRIMARY KEY (id);


--
-- Name: issued_certificates issued_certificates_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_serial_number_key UNIQUE (serial_number);


--
-- Name: leave_applications leave_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_applications
    ADD CONSTRAINT leave_applications_pkey PRIMARY KEY (id);


--
-- Name: leave_approvals leave_approvals_application_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approvals
    ADD CONSTRAINT leave_approvals_application_id_key UNIQUE (application_id);


--
-- Name: leave_approvals leave_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approvals
    ADD CONSTRAINT leave_approvals_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_user_id_leave_type_id_ac_ccd216f8_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_user_id_leave_type_id_ac_ccd216f8_uniq UNIQUE (user_id, leave_type_id, academic_year_id);


--
-- Name: leave_types leave_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_code_key UNIQUE (code);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_razorpay_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_razorpay_order_id_key UNIQUE (razorpay_order_id);


--
-- Name: payments payments_receipt_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_receipt_id_key UNIQUE (receipt_id);


--
-- Name: payroll_runs payroll_runs_month_year_921b079d_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_month_year_921b079d_uniq UNIQUE (month, year);


--
-- Name: payroll_runs payroll_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_pkey PRIMARY KEY (id);


--
-- Name: payslip_entries payslip_entries_payroll_run_id_staff_id_0d97ae90_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslip_entries
    ADD CONSTRAINT payslip_entries_payroll_run_id_staff_id_0d97ae90_uniq UNIQUE (payroll_run_id, staff_id);


--
-- Name: payslip_entries payslip_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslip_entries
    ADD CONSTRAINT payslip_entries_pkey PRIMARY KEY (id);


--
-- Name: principal_profiles principal_profiles_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.principal_profiles
    ADD CONSTRAINT principal_profiles_employee_id_key UNIQUE (employee_id);


--
-- Name: principal_profiles principal_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.principal_profiles
    ADD CONSTRAINT principal_profiles_pkey PRIMARY KEY (id);


--
-- Name: principal_profiles principal_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.principal_profiles
    ADD CONSTRAINT principal_profiles_user_id_key UNIQUE (user_id);


--
-- Name: report_card_templates report_card_templates_grade_id_academic_year_i_d6d57a14_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_templates
    ADD CONSTRAINT report_card_templates_grade_id_academic_year_i_d6d57a14_uniq UNIQUE (grade_id, academic_year_id, board_type);


--
-- Name: report_card_templates report_card_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_templates
    ADD CONSTRAINT report_card_templates_pkey PRIMARY KEY (id);


--
-- Name: report_card_terms_assessments report_card_terms_assess_reportcardterm_id_assess_4b74d8bb_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_terms_assessments
    ADD CONSTRAINT report_card_terms_assess_reportcardterm_id_assess_4b74d8bb_uniq UNIQUE (reportcardterm_id, assessment_id);


--
-- Name: report_card_terms_assessments report_card_terms_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_terms_assessments
    ADD CONSTRAINT report_card_terms_assessments_pkey PRIMARY KEY (id);


--
-- Name: report_card_terms report_card_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_terms
    ADD CONSTRAINT report_card_terms_pkey PRIMARY KEY (id);


--
-- Name: report_card_terms report_card_terms_template_id_term_3c954704_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_terms
    ADD CONSTRAINT report_card_terms_template_id_term_3c954704_uniq UNIQUE (template_id, term);


--
-- Name: salary_structures salary_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_pkey PRIMARY KEY (id);


--
-- Name: schedule_slots schedule_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_slots
    ADD CONSTRAINT schedule_slots_pkey PRIMARY KEY (id);


--
-- Name: school_settings school_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_settings
    ADD CONSTRAINT school_settings_pkey PRIMARY KEY (id);


--
-- Name: sections sections_grade_id_name_academic_year_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_grade_id_name_academic_year_id_key UNIQUE (grade_id, name, academic_year_id);


--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: source_documents source_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_documents
    ADD CONSTRAINT source_documents_pkey PRIMARY KEY (id);


--
-- Name: staff_hr_documents staff_hr_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_hr_documents
    ADD CONSTRAINT staff_hr_documents_pkey PRIMARY KEY (id);


--
-- Name: staff_profiles staff_profiles_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_employee_id_key UNIQUE (employee_id);


--
-- Name: staff_profiles staff_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_pkey PRIMARY KEY (id);


--
-- Name: staff_profiles staff_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_user_id_key UNIQUE (user_id);


--
-- Name: student_discounts student_discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_discounts
    ADD CONSTRAINT student_discounts_pkey PRIMARY KEY (id);


--
-- Name: student_documents student_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_student_id_key UNIQUE (student_id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: subjects subjects_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_code_key UNIQUE (code);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: teacher_profiles teacher_profiles_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_employee_id_key UNIQUE (employee_id);


--
-- Name: teacher_profiles teacher_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_pkey PRIMARY KEY (id);


--
-- Name: teacher_profiles teacher_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_user_id_key UNIQUE (user_id);


--
-- Name: token_blacklist_blacklistedtoken token_blacklist_blacklistedtoken_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_blacklist_blacklistedtoken
    ADD CONSTRAINT token_blacklist_blacklistedtoken_pkey PRIMARY KEY (id);


--
-- Name: token_blacklist_blacklistedtoken token_blacklist_blacklistedtoken_token_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_blacklist_blacklistedtoken
    ADD CONSTRAINT token_blacklist_blacklistedtoken_token_id_key UNIQUE (token_id);


--
-- Name: token_blacklist_outstandingtoken token_blacklist_outstandingtoken_jti_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_blacklist_outstandingtoken
    ADD CONSTRAINT token_blacklist_outstandingtoken_jti_key UNIQUE (jti);


--
-- Name: token_blacklist_outstandingtoken token_blacklist_outstandingtoken_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_blacklist_outstandingtoken
    ADD CONSTRAINT token_blacklist_outstandingtoken_pkey PRIMARY KEY (id);


--
-- Name: tuition_accounts tuition_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tuition_accounts
    ADD CONSTRAINT tuition_accounts_pkey PRIMARY KEY (id);


--
-- Name: tuition_accounts tuition_accounts_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tuition_accounts
    ADD CONSTRAINT tuition_accounts_student_id_key UNIQUE (student_id);


--
-- Name: tuition_line_items tuition_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tuition_line_items
    ADD CONSTRAINT tuition_line_items_pkey PRIMARY KEY (id);


--
-- Name: udise_annual_data udise_annual_data_academic_year_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.udise_annual_data
    ADD CONSTRAINT udise_annual_data_academic_year_id_key UNIQUE (academic_year_id);


--
-- Name: udise_annual_data udise_annual_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.udise_annual_data
    ADD CONSTRAINT udise_annual_data_pkey PRIMARY KEY (id);


--
-- Name: udise_export_logs udise_export_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.udise_export_logs
    ADD CONSTRAINT udise_export_logs_pkey PRIMARY KEY (id);


--
-- Name: udise_profile udise_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.udise_profile
    ADD CONSTRAINT udise_profile_pkey PRIMARY KEY (id);


--
-- Name: udise_profile udise_profile_udise_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.udise_profile
    ADD CONSTRAINT udise_profile_udise_code_key UNIQUE (udise_code);


--
-- Name: user_tour_progress user_tour_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tour_progress
    ADD CONSTRAINT user_tour_progress_pkey PRIMARY KEY (id);


--
-- Name: user_tour_progress user_tour_progress_user_id_tour_key_61c9f198_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tour_progress
    ADD CONSTRAINT user_tour_progress_user_id_tour_key_61c9f198_uniq UNIQUE (user_id, tour_key);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_groups users_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_groups
    ADD CONSTRAINT users_groups_pkey PRIMARY KEY (id);


--
-- Name: users_groups users_groups_user_id_group_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_groups
    ADD CONSTRAINT users_groups_user_id_group_id_key UNIQUE (user_id, group_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_user_permissions users_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_user_permissions
    ADD CONSTRAINT users_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: users_user_permissions users_user_permissions_user_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_user_permissions
    ADD CONSTRAINT users_user_permissions_user_id_permission_id_key UNIQUE (user_id, permission_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: announcements_created_by_id_191f571f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX announcements_created_by_id_191f571f ON public.announcements USING btree (created_by_id);


--
-- Name: audit_logs_actor_id_303d1495; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_actor_id_303d1495 ON public.audit_logs USING btree (actor_id);


--
-- Name: audit_logs_target_user_id_8a3ccc70; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_target_user_id_8a3ccc70 ON public.audit_logs USING btree (target_user_id);


--
-- Name: fee_template_items_template_id_dc069e4b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fee_template_items_template_id_dc069e4b ON public.fee_template_items USING btree (template_id);


--
-- Name: fee_templates_academic_year_id_b82de25d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fee_templates_academic_year_id_b82de25d ON public.fee_templates USING btree (academic_year_id);


--
-- Name: generated_report_cards_academic_year_id_2a548480; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX generated_report_cards_academic_year_id_2a548480 ON public.generated_report_cards USING btree (academic_year_id);


--
-- Name: generated_report_cards_generated_by_id_684f7419; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX generated_report_cards_generated_by_id_684f7419 ON public.generated_report_cards USING btree (generated_by_id);


--
-- Name: generated_report_cards_student_id_1f3ad391; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX generated_report_cards_student_id_1f3ad391 ON public.generated_report_cards USING btree (student_id);


--
-- Name: generated_report_cards_template_id_2f367e54; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX generated_report_cards_template_id_2f367e54 ON public.generated_report_cards USING btree (template_id);


--
-- Name: generated_report_cards_term_id_d474956f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX generated_report_cards_term_id_d474956f ON public.generated_report_cards USING btree (term_id);


--
-- Name: guardians_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX guardians_phone_idx ON public.guardians USING btree (phone);


--
-- Name: id_configurations_role_43cd172a_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX id_configurations_role_43cd172a_like ON public.id_configurations USING btree (role varchar_pattern_ops);


--
-- Name: idx_admission_applications_application_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admission_applications_application_id ON public.admission_applications USING btree (application_id);


--
-- Name: idx_admission_applications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admission_applications_status ON public.admission_applications USING btree (status);


--
-- Name: idx_assessments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessments_status ON public.assessments USING btree (status);


--
-- Name: idx_auth_permission_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_auth_permission_unique ON public.auth_permission USING btree (content_type_id, codename);


--
-- Name: idx_django_session_expire_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_django_session_expire_date ON public.django_session USING btree (expire_date);


--
-- Name: idx_generated_questions_reference_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generated_questions_reference_id ON public.generated_questions USING btree (reference_id);


--
-- Name: idx_generated_questions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generated_questions_status ON public.generated_questions USING btree (status);


--
-- Name: idx_payments_receipt_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_receipt_id ON public.payments USING btree (receipt_id);


--
-- Name: idx_student_profiles_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_profiles_student_id ON public.student_profiles USING btree (student_id);


--
-- Name: idx_teacher_profiles_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teacher_profiles_employee_id ON public.teacher_profiles USING btree (employee_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: issued_certificates_issued_by_id_4a3fa0f3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX issued_certificates_issued_by_id_4a3fa0f3 ON public.issued_certificates USING btree (issued_by_id);


--
-- Name: issued_certificates_serial_number_b141ec87_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX issued_certificates_serial_number_b141ec87_like ON public.issued_certificates USING btree (serial_number varchar_pattern_ops);


--
-- Name: issued_certificates_student_id_bd80f9b7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX issued_certificates_student_id_bd80f9b7 ON public.issued_certificates USING btree (student_id);


--
-- Name: issued_certificates_template_id_06296d42; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX issued_certificates_template_id_06296d42 ON public.issued_certificates USING btree (template_id);


--
-- Name: leave_appli_applica_dcbc4c_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_appli_applica_dcbc4c_idx ON public.leave_applications USING btree (applicant_id, status);


--
-- Name: leave_appli_start_d_424510_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_appli_start_d_424510_idx ON public.leave_applications USING btree (start_date, end_date);


--
-- Name: leave_appli_status_980627_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_appli_status_980627_idx ON public.leave_applications USING btree (status, applied_at);


--
-- Name: leave_applications_applicant_id_134ae7b0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_applications_applicant_id_134ae7b0 ON public.leave_applications USING btree (applicant_id);


--
-- Name: leave_applications_leave_type_id_fa4ab641; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_applications_leave_type_id_fa4ab641 ON public.leave_applications USING btree (leave_type_id);


--
-- Name: leave_appro_approve_1631b7_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_appro_approve_1631b7_idx ON public.leave_approvals USING btree (approver_id, acted_at);


--
-- Name: leave_approvals_approver_id_42d9bfce; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_approvals_approver_id_42d9bfce ON public.leave_approvals USING btree (approver_id);


--
-- Name: leave_balan_user_id_da28cd_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_balan_user_id_da28cd_idx ON public.leave_balances USING btree (user_id, academic_year_id);


--
-- Name: leave_balances_academic_year_id_27d949f2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_balances_academic_year_id_27d949f2 ON public.leave_balances USING btree (academic_year_id);


--
-- Name: leave_balances_leave_type_id_a8915386; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_balances_leave_type_id_a8915386 ON public.leave_balances USING btree (leave_type_id);


--
-- Name: leave_balances_user_id_ae11f6b4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_balances_user_id_ae11f6b4 ON public.leave_balances USING btree (user_id);


--
-- Name: leave_types_applica_70db83_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_types_applica_70db83_idx ON public.leave_types USING btree (applicable_to, is_active);


--
-- Name: leave_types_code_8c30f5_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_types_code_8c30f5_idx ON public.leave_types USING btree (code);


--
-- Name: leave_types_code_e0790cfe_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_types_code_e0790cfe_like ON public.leave_types USING btree (code varchar_pattern_ops);


--
-- Name: otps_email_32bf71_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX otps_email_32bf71_idx ON public.otps USING btree (email, purpose, is_used);


--
-- Name: otps_phone_purpose_used_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX otps_phone_purpose_used_idx ON public.otps USING btree (phone, purpose, is_used);


--
-- Name: payment_methods_user_id_d4fe6d88; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_methods_user_id_d4fe6d88 ON public.payment_methods USING btree (user_id);


--
-- Name: payments_razorpay_order_id_bff90b31_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_razorpay_order_id_bff90b31_like ON public.payments USING btree (razorpay_order_id varchar_pattern_ops);


--
-- Name: payments_rzp_payment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_rzp_payment_idx ON public.payments USING btree (razorpay_payment_id);


--
-- Name: payroll_run_status_b4e05c_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payroll_run_status_b4e05c_idx ON public.payroll_runs USING btree (status);


--
-- Name: payroll_runs_academic_year_id_9916cd75; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payroll_runs_academic_year_id_9916cd75 ON public.payroll_runs USING btree (academic_year_id);


--
-- Name: payroll_runs_processed_by_id_e804fc8b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payroll_runs_processed_by_id_e804fc8b ON public.payroll_runs USING btree (processed_by_id);


--
-- Name: payslip_ent_payroll_7a9933_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payslip_ent_payroll_7a9933_idx ON public.payslip_entries USING btree (payroll_run_id, staff_id);


--
-- Name: payslip_entries_payroll_run_id_c4082220; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payslip_entries_payroll_run_id_c4082220 ON public.payslip_entries USING btree (payroll_run_id);


--
-- Name: payslip_entries_staff_id_56c68cb3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payslip_entries_staff_id_56c68cb3 ON public.payslip_entries USING btree (staff_id);


--
-- Name: principal_p_employe_d2c2f9_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX principal_p_employe_d2c2f9_idx ON public.principal_profiles USING btree (employee_id);


--
-- Name: principal_profiles_department_id_c99dbbff; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX principal_profiles_department_id_c99dbbff ON public.principal_profiles USING btree (department_id);


--
-- Name: principal_profiles_employee_id_5383f2ab_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX principal_profiles_employee_id_5383f2ab_like ON public.principal_profiles USING btree (employee_id varchar_pattern_ops);


--
-- Name: report_card_templates_academic_year_id_de4bb5df; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_card_templates_academic_year_id_de4bb5df ON public.report_card_templates USING btree (academic_year_id);


--
-- Name: report_card_templates_grade_id_c3b01a8d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_card_templates_grade_id_c3b01a8d ON public.report_card_templates USING btree (grade_id);


--
-- Name: report_card_terms_assessments_assessment_id_d913c45d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_card_terms_assessments_assessment_id_d913c45d ON public.report_card_terms_assessments USING btree (assessment_id);


--
-- Name: report_card_terms_assessments_reportcardterm_id_86008d50; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_card_terms_assessments_reportcardterm_id_86008d50 ON public.report_card_terms_assessments USING btree (reportcardterm_id);


--
-- Name: report_card_terms_template_id_95a5e2c0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_card_terms_template_id_95a5e2c0 ON public.report_card_terms USING btree (template_id);


--
-- Name: salary_stru_effecti_d04f1d_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX salary_stru_effecti_d04f1d_idx ON public.salary_structures USING btree (effective_from);


--
-- Name: salary_stru_user_id_10bd64_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX salary_stru_user_id_10bd64_idx ON public.salary_structures USING btree (user_id, is_active);


--
-- Name: salary_structures_user_id_74fd0233; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX salary_structures_user_id_74fd0233 ON public.salary_structures USING btree (user_id);


--
-- Name: staff_hr_documents_staff_id_18542056; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX staff_hr_documents_staff_id_18542056 ON public.staff_hr_documents USING btree (staff_id);


--
-- Name: staff_profi_employe_c0da74_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX staff_profi_employe_c0da74_idx ON public.staff_profiles USING btree (employee_id);


--
-- Name: staff_profi_is_acti_7aefb7_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX staff_profi_is_acti_7aefb7_idx ON public.staff_profiles USING btree (is_active);


--
-- Name: staff_profiles_department_id_a3ea3627; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX staff_profiles_department_id_a3ea3627 ON public.staff_profiles USING btree (department_id);


--
-- Name: staff_profiles_employee_id_73b7cc59_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX staff_profiles_employee_id_73b7cc59_like ON public.staff_profiles USING btree (employee_id varchar_pattern_ops);


--
-- Name: student_discounts_applied_by_id_6a07fde1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_discounts_applied_by_id_6a07fde1 ON public.student_discounts USING btree (applied_by_id);


--
-- Name: student_discounts_student_id_eb48e8f2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_discounts_student_id_eb48e8f2 ON public.student_discounts USING btree (student_id);


--
-- Name: udise_export_logs_academic_year_id_15cb8b2e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX udise_export_logs_academic_year_id_15cb8b2e ON public.udise_export_logs USING btree (academic_year_id);


--
-- Name: udise_export_logs_exported_by_id_bfc60aec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX udise_export_logs_exported_by_id_bfc60aec ON public.udise_export_logs USING btree (exported_by_id);


--
-- Name: udise_profile_udise_code_962bcd8d_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX udise_profile_udise_code_962bcd8d_like ON public.udise_profile USING btree (udise_code varchar_pattern_ops);


--
-- Name: user_tour_p_user_id_c623a7_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_tour_p_user_id_c623a7_idx ON public.user_tour_progress USING btree (user_id, tour_key);


--
-- Name: user_tour_progress_user_id_eb3666e9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_tour_progress_user_id_eb3666e9 ON public.user_tour_progress USING btree (user_id);


--
-- Name: admin_notifications admin_notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: admission_applications admission_applications_grade_applying_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_applications
    ADD CONSTRAINT admission_applications_grade_applying_id_fkey FOREIGN KEY (grade_applying_id) REFERENCES public.grades(id) ON DELETE SET NULL;


--
-- Name: admission_applications admission_applications_reviewed_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_applications
    ADD CONSTRAINT admission_applications_reviewed_by_id_fkey FOREIGN KEY (reviewed_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: admission_applications admission_applications_student_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_applications
    ADD CONSTRAINT admission_applications_student_created_id_fkey FOREIGN KEY (student_created_id) REFERENCES public.student_profiles(id) ON DELETE SET NULL;


--
-- Name: admission_documents admission_documents_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_documents
    ADD CONSTRAINT admission_documents_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.admission_applications(id) ON DELETE CASCADE;


--
-- Name: announcements announcements_created_by_id_191f571f_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_id_191f571f_fk_users_id FOREIGN KEY (created_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assessment_questions assessment_questions_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_questions assessment_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.generated_questions(id) ON DELETE CASCADE;


--
-- Name: assessments assessments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: assessments assessments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: assessments assessments_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_actor_id_303d1495_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_id_303d1495_fk_users_id FOREIGN KEY (actor_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: audit_logs audit_logs_target_user_id_8a3ccc70_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_target_user_id_8a3ccc70_fk_users_id FOREIGN KEY (target_user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: conversations_participants conversations_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations_participants
    ADD CONSTRAINT conversations_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversations_participants conversations_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations_participants
    ADD CONSTRAINT conversations_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: courses courses_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE CASCADE;


--
-- Name: courses courses_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;


--
-- Name: courses courses_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: courses courses_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: django_admin_log django_admin_log_content_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_fkey FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) ON DELETE SET NULL;


--
-- Name: django_admin_log django_admin_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: extracurricular_activities extracurricular_activities_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extracurricular_activities
    ADD CONSTRAINT extracurricular_activities_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: fee_template_items fee_template_items_template_id_dc069e4b_fk_fee_templates_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_template_items
    ADD CONSTRAINT fee_template_items_template_id_dc069e4b_fk_fee_templates_id FOREIGN KEY (template_id) REFERENCES public.fee_templates(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: fee_templates fee_templates_academic_year_id_b82de25d_fk_academic_years_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_templates
    ADD CONSTRAINT fee_templates_academic_year_id_b82de25d_fk_academic_years_id FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: fee_templates fee_templates_grade_id_36f5b3ae_fk_grades_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_templates
    ADD CONSTRAINT fee_templates_grade_id_36f5b3ae_fk_grades_id FOREIGN KEY (grade_id) REFERENCES public.grades(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_permission fk_auth_permission_content_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT fk_auth_permission_content_type FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) ON DELETE CASCADE;


--
-- Name: generated_questions generated_questions_approved_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_questions
    ADD CONSTRAINT generated_questions_approved_by_id_fkey FOREIGN KEY (approved_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: generated_questions generated_questions_source_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_questions
    ADD CONSTRAINT generated_questions_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES public.source_documents(id) ON DELETE CASCADE;


--
-- Name: generated_questions generated_questions_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_questions
    ADD CONSTRAINT generated_questions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: generated_report_cards generated_report_car_academic_year_id_2a548480_fk_academic_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_report_cards
    ADD CONSTRAINT generated_report_car_academic_year_id_2a548480_fk_academic_ FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: generated_report_cards generated_report_car_student_id_1f3ad391_fk_student_p; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_report_cards
    ADD CONSTRAINT generated_report_car_student_id_1f3ad391_fk_student_p FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: generated_report_cards generated_report_car_template_id_2f367e54_fk_report_ca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_report_cards
    ADD CONSTRAINT generated_report_car_template_id_2f367e54_fk_report_ca FOREIGN KEY (template_id) REFERENCES public.report_card_templates(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: generated_report_cards generated_report_cards_generated_by_id_684f7419_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_report_cards
    ADD CONSTRAINT generated_report_cards_generated_by_id_684f7419_fk_users_id FOREIGN KEY (generated_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: generated_report_cards generated_report_cards_term_id_d474956f_fk_report_card_terms_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_report_cards
    ADD CONSTRAINT generated_report_cards_term_id_d474956f_fk_report_card_terms_id FOREIGN KEY (term_id) REFERENCES public.report_card_terms(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: grade_entries grade_entries_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_entries
    ADD CONSTRAINT grade_entries_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: grade_entries grade_entries_graded_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_entries
    ADD CONSTRAINT grade_entries_graded_by_id_fkey FOREIGN KEY (graded_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: grade_entries grade_entries_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_entries
    ADD CONSTRAINT grade_entries_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: guardians guardians_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guardians
    ADD CONSTRAINT guardians_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: health_observations health_observations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_observations
    ADD CONSTRAINT health_observations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: health_observations health_observations_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_observations
    ADD CONSTRAINT health_observations_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: health_records health_records_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_records
    ADD CONSTRAINT health_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: institution_events institution_events_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institution_events
    ADD CONSTRAINT institution_events_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: issued_certificates issued_certificates_issued_by_id_4a3fa0f3_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_issued_by_id_4a3fa0f3_fk_users_id FOREIGN KEY (issued_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: issued_certificates issued_certificates_student_id_bd80f9b7_fk_student_profiles_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_student_id_bd80f9b7_fk_student_profiles_id FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: issued_certificates issued_certificates_template_id_06296d42_fk_certifica; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_template_id_06296d42_fk_certifica FOREIGN KEY (template_id) REFERENCES public.certificate_templates(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: leave_applications leave_applications_applicant_id_134ae7b0_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_applications
    ADD CONSTRAINT leave_applications_applicant_id_134ae7b0_fk_users_id FOREIGN KEY (applicant_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: leave_applications leave_applications_leave_type_id_fa4ab641_fk_leave_types_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_applications
    ADD CONSTRAINT leave_applications_leave_type_id_fa4ab641_fk_leave_types_id FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: leave_approvals leave_approvals_application_id_5c6b20f7_fk_leave_app; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approvals
    ADD CONSTRAINT leave_approvals_application_id_5c6b20f7_fk_leave_app FOREIGN KEY (application_id) REFERENCES public.leave_applications(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: leave_approvals leave_approvals_approver_id_42d9bfce_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approvals
    ADD CONSTRAINT leave_approvals_approver_id_42d9bfce_fk_users_id FOREIGN KEY (approver_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: leave_balances leave_balances_academic_year_id_27d949f2_fk_academic_years_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_academic_year_id_27d949f2_fk_academic_years_id FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: leave_balances leave_balances_leave_type_id_a8915386_fk_leave_types_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_leave_type_id_a8915386_fk_leave_types_id FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: leave_balances leave_balances_user_id_ae11f6b4_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_user_id_ae11f6b4_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payment_methods payment_methods_user_id_d4fe6d88_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_user_id_d4fe6d88_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payments payments_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.tuition_accounts(id) ON DELETE CASCADE;


--
-- Name: payments payments_paid_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_paid_by_id_fkey FOREIGN KEY (paid_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payroll_runs payroll_runs_academic_year_id_9916cd75_fk_academic_years_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_academic_year_id_9916cd75_fk_academic_years_id FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payroll_runs payroll_runs_processed_by_id_e804fc8b_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_processed_by_id_e804fc8b_fk_users_id FOREIGN KEY (processed_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payslip_entries payslip_entries_payroll_run_id_c4082220_fk_payroll_runs_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslip_entries
    ADD CONSTRAINT payslip_entries_payroll_run_id_c4082220_fk_payroll_runs_id FOREIGN KEY (payroll_run_id) REFERENCES public.payroll_runs(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payslip_entries payslip_entries_staff_id_56c68cb3_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslip_entries
    ADD CONSTRAINT payslip_entries_staff_id_56c68cb3_fk_users_id FOREIGN KEY (staff_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: principal_profiles principal_profiles_department_id_c99dbbff_fk_departments_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.principal_profiles
    ADD CONSTRAINT principal_profiles_department_id_c99dbbff_fk_departments_id FOREIGN KEY (department_id) REFERENCES public.departments(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: principal_profiles principal_profiles_user_id_8e40109a_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.principal_profiles
    ADD CONSTRAINT principal_profiles_user_id_8e40109a_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: report_card_templates report_card_template_academic_year_id_de4bb5df_fk_academic_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_templates
    ADD CONSTRAINT report_card_template_academic_year_id_de4bb5df_fk_academic_ FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: report_card_templates report_card_templates_grade_id_c3b01a8d_fk_grades_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_templates
    ADD CONSTRAINT report_card_templates_grade_id_c3b01a8d_fk_grades_id FOREIGN KEY (grade_id) REFERENCES public.grades(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: report_card_terms_assessments report_card_terms_as_assessment_id_d913c45d_fk_assessmen; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_terms_assessments
    ADD CONSTRAINT report_card_terms_as_assessment_id_d913c45d_fk_assessmen FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: report_card_terms_assessments report_card_terms_as_reportcardterm_id_86008d50_fk_report_ca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_terms_assessments
    ADD CONSTRAINT report_card_terms_as_reportcardterm_id_86008d50_fk_report_ca FOREIGN KEY (reportcardterm_id) REFERENCES public.report_card_terms(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: report_card_terms report_card_terms_template_id_95a5e2c0_fk_report_ca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_terms
    ADD CONSTRAINT report_card_terms_template_id_95a5e2c0_fk_report_ca FOREIGN KEY (template_id) REFERENCES public.report_card_templates(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: salary_structures salary_structures_user_id_74fd0233_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_user_id_74fd0233_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: schedule_slots schedule_slots_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_slots
    ADD CONSTRAINT schedule_slots_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: sections sections_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE CASCADE;


--
-- Name: sections sections_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(id) ON DELETE CASCADE;


--
-- Name: source_documents source_documents_uploaded_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_documents
    ADD CONSTRAINT source_documents_uploaded_by_id_fkey FOREIGN KEY (uploaded_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: staff_hr_documents staff_hr_documents_staff_id_18542056_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_hr_documents
    ADD CONSTRAINT staff_hr_documents_staff_id_18542056_fk_users_id FOREIGN KEY (staff_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: staff_profiles staff_profiles_department_id_a3ea3627_fk_departments_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_department_id_a3ea3627_fk_departments_id FOREIGN KEY (department_id) REFERENCES public.departments(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: staff_profiles staff_profiles_user_id_1f872083_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_user_id_1f872083_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: student_discounts student_discounts_applied_by_id_6a07fde1_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_discounts
    ADD CONSTRAINT student_discounts_applied_by_id_6a07fde1_fk_users_id FOREIGN KEY (applied_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: student_discounts student_discounts_student_id_eb48e8f2_fk_student_profiles_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_discounts
    ADD CONSTRAINT student_discounts_student_id_eb48e8f2_fk_student_profiles_id FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: student_documents student_documents_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: student_documents student_documents_verified_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_verified_by_id_fkey FOREIGN KEY (verified_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: student_profiles student_profiles_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE SET NULL;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subjects subjects_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: teacher_profiles teacher_profiles_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: teacher_profiles teacher_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: token_blacklist_blacklistedtoken token_blacklist_blacklistedtoken_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_blacklist_blacklistedtoken
    ADD CONSTRAINT token_blacklist_blacklistedtoken_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.token_blacklist_outstandingtoken(id) ON DELETE CASCADE;


--
-- Name: token_blacklist_outstandingtoken token_blacklist_outstandingtoken_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_blacklist_outstandingtoken
    ADD CONSTRAINT token_blacklist_outstandingtoken_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tuition_accounts tuition_accounts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tuition_accounts
    ADD CONSTRAINT tuition_accounts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: tuition_line_items tuition_line_items_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tuition_line_items
    ADD CONSTRAINT tuition_line_items_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.tuition_accounts(id) ON DELETE CASCADE;


--
-- Name: udise_annual_data udise_annual_data_academic_year_id_e1aa6cdd_fk_academic_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.udise_annual_data
    ADD CONSTRAINT udise_annual_data_academic_year_id_e1aa6cdd_fk_academic_ FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: udise_export_logs udise_export_logs_academic_year_id_15cb8b2e_fk_academic_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.udise_export_logs
    ADD CONSTRAINT udise_export_logs_academic_year_id_15cb8b2e_fk_academic_ FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: udise_export_logs udise_export_logs_exported_by_id_bfc60aec_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.udise_export_logs
    ADD CONSTRAINT udise_export_logs_exported_by_id_bfc60aec_fk_users_id FOREIGN KEY (exported_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_tour_progress user_tour_progress_user_id_eb3666e9_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tour_progress
    ADD CONSTRAINT user_tour_progress_user_id_eb3666e9_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_groups users_groups_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_groups
    ADD CONSTRAINT users_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.auth_group(id) ON DELETE CASCADE;


--
-- Name: users_groups users_groups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_groups
    ADD CONSTRAINT users_groups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users_user_permissions users_user_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_user_permissions
    ADD CONSTRAINT users_user_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) ON DELETE CASCADE;


--
-- Name: users_user_permissions users_user_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_user_permissions
    ADD CONSTRAINT users_user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: announcements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: certificate_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: fee_template_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fee_template_items ENABLE ROW LEVEL SECURITY;

--
-- Name: fee_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fee_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: generated_report_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.generated_report_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: id_configurations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.id_configurations ENABLE ROW LEVEL SECURITY;

--
-- Name: issued_certificates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;

--
-- Name: leave_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: leave_approvals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leave_approvals ENABLE ROW LEVEL SECURITY;

--
-- Name: leave_balances; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

--
-- Name: leave_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

--
-- Name: otps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

--
-- Name: payroll_runs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: payslip_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payslip_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: principal_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.principal_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: report_card_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.report_card_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: report_card_terms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.report_card_terms ENABLE ROW LEVEL SECURITY;

--
-- Name: report_card_terms_assessments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.report_card_terms_assessments ENABLE ROW LEVEL SECURITY;

--
-- Name: salary_structures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;

--
-- Name: school_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: staff_hr_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staff_hr_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: staff_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: student_discounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_discounts ENABLE ROW LEVEL SECURITY;

--
-- Name: udise_annual_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.udise_annual_data ENABLE ROW LEVEL SECURITY;

--
-- Name: udise_export_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.udise_export_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: udise_profile; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.udise_profile ENABLE ROW LEVEL SECURITY;

--
-- Name: user_tour_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_tour_progress ENABLE ROW LEVEL SECURITY;

--
--


