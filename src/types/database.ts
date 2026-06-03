export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InterviewSessionStatus = "draft" | "active" | "completed" | "archived";

export type InterviewMessageRole = "ai" | "expert" | "system";

export type ExtractedPatternCategory =
  | "hidden_anxiety"
  | "first_question"
  | "followup_question"
  | "decision_point"
  | "talk_example"
  | "ng_expression"
  | "next_action"
  | "experience_rule"
  | "other";

export type Database = {
  public: {
    Tables: {
      interview_sessions: {
        Row: {
          id: string;
          theme: string;
          status: InterviewSessionStatus;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          theme: string;
          status?: InterviewSessionStatus;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          theme?: string;
          status?: InterviewSessionStatus;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interview_messages: {
        Row: {
          id: string;
          session_id: string;
          role: InterviewMessageRole;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: InterviewMessageRole;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: InterviewMessageRole;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_messages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "interview_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      extracted_patterns: {
        Row: {
          id: string;
          session_id: string;
          category: ExtractedPatternCategory;
          customer_phrase: string | null;
          hidden_anxiety: string | null;
          first_question: string | null;
          followup_questions: string[];
          decision_points: string[];
          talk_example: string | null;
          ng_phrases: string[];
          next_action: string | null;
          confidence_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          category: ExtractedPatternCategory;
          customer_phrase?: string | null;
          hidden_anxiety?: string | null;
          first_question?: string | null;
          followup_questions?: string[];
          decision_points?: string[];
          talk_example?: string | null;
          ng_phrases?: string[];
          next_action?: string | null;
          confidence_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          category?: ExtractedPatternCategory;
          customer_phrase?: string | null;
          hidden_anxiety?: string | null;
          first_question?: string | null;
          followup_questions?: string[];
          decision_points?: string[];
          talk_example?: string | null;
          ng_phrases?: string[];
          next_action?: string | null;
          confidence_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "extracted_patterns_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "interview_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      pattern_feedback: {
        Row: {
          id: string;
          pattern_id: string;
          rating: number | null;
          feedback_text: string | null;
          is_usable: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pattern_id: string;
          rating?: number | null;
          feedback_text?: string | null;
          is_usable?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pattern_id?: string;
          rating?: number | null;
          feedback_text?: string | null;
          is_usable?: boolean | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pattern_feedback_pattern_id_fkey";
            columns: ["pattern_id"];
            isOneToOne: false;
            referencedRelation: "extracted_patterns";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      interview_session_status: InterviewSessionStatus;
      interview_message_role: InterviewMessageRole;
      extracted_pattern_category: ExtractedPatternCategory;
    };
    CompositeTypes: Record<string, never>;
  };
};
