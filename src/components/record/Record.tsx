'use client';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Button, Form, Input, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useContext } from 'react';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { PrettyFirebaseError, recordFav } from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';
import type { FavRecord } from '@/types/FavRecord';

const validateUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (_e) {
    return false;
  }
};

type FavRecordForm = Omit<FavRecord, 'date' | 'id'>;

export default function Record() {
  const userContext = useContext(FirebaseAuthContext);
  const [messageApi, contextHolder] = message.useMessage();
  const key = 'record';
  const [form] = useForm<FavRecordForm>();

  const onSubmit = async (values: FavRecordForm) => {
    const user = userContext.user;
    if (user) {
      messageApi.open({
        key,
        type: 'loading',
        content: 'Recording your fav...',
        duration: 0,
      });

      const res = await recordFav(values.url);
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
        form.resetFields();
      }
    } else {
      messageApi.open({
        key,
        type: 'error',
        content: 'User is not logged in.',
      });
    }
  };

  return (
    <div className="py-4">
      <FavConfigProvider>
        {contextHolder}

        <Form
          layout="horizontal"
          labelCol={{ span: 1 }}
          onFinish={onSubmit}
          form={form}
        >
          <Form.Item
            name="url"
            rules={[
              {
                required: true,
              },
              () => ({
                validator(_, value: string | undefined) {
                  if (!!value && validateUrl(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Invalid URL'));
                },
              }),
            ]}
          >
            <Input
              placeholder="URL you read/liked"
              spellCheck={false}
              allowClear={true}
              size="large"
            />
          </Form.Item>

          <Form.Item className="text-center">
            <Button htmlType="submit" type="primary">
              <AddCircleOutlineIcon
                sx={{ width: 20, height: 20 }}
                className="pb-[1px]"
              />
              <span className="ml-1 font-bold">Record</span>
            </Button>
          </Form.Item>
        </Form>
      </FavConfigProvider>
    </div>
  );
}
