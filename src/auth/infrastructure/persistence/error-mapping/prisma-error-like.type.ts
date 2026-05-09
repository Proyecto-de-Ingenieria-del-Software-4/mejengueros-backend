export type PrismaErrorLike = {
  code?: string;
  message?: string;
  meta?: {
    target?: string[] | string;
  };
};
