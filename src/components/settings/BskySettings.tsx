'use client';

import { FavConfigProvider } from '@/lib/theme';
import { Button, Checkbox, Collapse, Form, Input, Switch } from 'antd';

const BskyAccountPanel = () => {
  type FieldType = {
    username?: string;
    appPassword?: string;
  };

  const panel = () => {
    return (
      <FavConfigProvider>
        <div>
          <Form autoComplete="off" layout="vertical">
            <Form.Item<FieldType>
              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Please enter your Bluesky username.',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item<FieldType>
              label="App Password"
              name="appPassword"
              rules={[
                {
                  required: true,
                  message: 'Please enter your Bluesky app password.',
                },
              ]}
            >
              <Input.Password autoComplete="off" />
            </Form.Item>
            <Form.Item className="w-full text-center">
              <Button
                type="primary"
                htmlType="submit"
                className="mx-auto bg-[#dc03dc]"
              >
                Update
              </Button>
            </Form.Item>
          </Form>
        </div>
      </FavConfigProvider>
    );
  };

  return (
    <FavConfigProvider>
      <div className="mt-3">
        <Collapse
          items={[
            {
              key: '1',
              label: 'Bluesky Account',
              children: panel(),
            },
          ]}
          style={{ background: 'transparent' }}
        />
      </div>
    </FavConfigProvider>
  );
};

export default function BskySettings() {
  return (
    <>
      <FavConfigProvider>
        <div className="mb-3 flex items-center">
          <h2 className="mb-1 mr-4 text-2xl font-bold">Bluesky Integration</h2>
          <Switch className="bg-slate-600" />
        </div>
        <p className="mb-3">
          When enabled, you can automatically post your records and weekly
          summary to{' '}
          <a
            href="https://bsky.app/"
            target="_blank"
            className="text-pink-500 underline"
          >
            Bluesky
          </a>
          .
        </p>

        <div className="flex flex-col">
          <div className="mb-2">
            <Checkbox>
              <p>Post when your record your favorites.</p>
            </Checkbox>
            <p className="ml-6 text-sm text-slate-500">
              Enabling this will post your record to Bluesky everytime your
              record your URL.
            </p>
          </div>
          <div className="mb-2">
            <Checkbox disabled>
              <p>Post weekly summary to Bluesky.</p>
            </Checkbox>
            <p className="ml-6 text-sm text-slate-500">
              Enabling this will post the weekly summary to Bluesky.
            </p>
          </div>

          <BskyAccountPanel />
        </div>
      </FavConfigProvider>
    </>
  );
}
