import { mainHost } from '@/config/http';

export function feadback({
  content,
  contact,
}: {
  content: string;
  contact: string;
}) {
  return mainHost.post(`/question/feedback`, {
    data: `content=${content}&contact=${contact}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}
