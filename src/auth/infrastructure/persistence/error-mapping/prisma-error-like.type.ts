export type PrismaErrorLike = {
  code?: string;
  meta?: {
    target?: string[] | string;
  };
};
