'use client';

import { Button, Form, Input, message } from 'antd';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { FavRecord } from '@/types/FavRecord';
import dayjs from 'dayjs';
import { PrettyFirebaseError, recordFav } from '@/lib/firebase/store';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { useContext } from 'react';

const validateURL = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

type FavRecordForm = Omit<FavRecord, 'date' | 'id'>;

export default function Record() {
  const userContext = useContext(FirebaseAuthContext);
  const [messageApi, contextHolder] = message.useMessage();
  const key = 'record';

  const onSubmit = async (values: FavRecordForm) => {
    const user = userContext.user;
    if (user) {
      const valuesToSubmit = {
        ...values,
        date: dayjs().toDate(),
      };
      messageApi.open({
        key,
        type: 'loading',
        content: 'Recording your fav...',
      });

      const res = await recordFav(user, valuesToSubmit);
      if (res instanceof PrettyFirebaseError) {
        messageApi.open({
          key,
          type: 'error',
          content: `Error: ${res.message}`,
        });
      } else {
        messageApi.open({
          key,
          type: 'success',
          content: 'Recorded successfully.',
        });
      }
    } else {
      messageApi.open({
        key,
        type: 'error',
        content: 'User is not logged in.',
      });
    }

    console.log('set');
  };

  return (
    <div className="rounded-lg p-4">
      {contextHolder}

      <Form layout="horizontal" labelCol={{ span: 1 }} onFinish={onSubmit}>
        <Form.Item
          name="url"
          rules={[
            {
              required: true,
              message: 'URL you read/liked',
            },
            () => ({
              validator(_, value: string | undefined) {
                if (!!value && validateURL(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Invalid URL'));
              },
            }),
          ]}
        >
          <Input placeholder="URL you read/liked" spellCheck={false} />
        </Form.Item>

        <Form.Item className="text-center">
          <Button htmlType="submit">
            <AddCircleOutlineIcon
              sx={{ width: 20, height: 20 }}
              className="pb-[1px]"
            />
            <span className="ml-1">Record</span>
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
