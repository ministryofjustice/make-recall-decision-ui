export type RecommendationFileResponse = {
  id?: number;
  recommendationId?: number;
  createdBy: string;
  createdByUserFullName: string;
  created: string;
  category: string;
  token: string;
  name?: string;
  s3Id?: string;
  type?: string;
  size?: string;
  notes?: string;
  link?: string;
};