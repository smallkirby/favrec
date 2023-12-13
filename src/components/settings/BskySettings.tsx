'use client';

import { updateBskyAccount, updateGeneralSettings } from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';
import { FirebaseUser } from '@/types/FirebaseUser';
import { Settings } from '@/types/Settings';
import { Button, Checkbox, Collapse, Form, Input, Switch, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';

type Props = {
  user: FirebaseUser;
  settings: Settings;
  disabled?: boolean;
};

const BskyAccountPanel = ({ user, settings, disabled }: Props) => {
  type FieldType = {
    username?: string;
    appPassword?: string;
  };

  const [updating, setUpdating] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = useForm<FieldType>();

  const onUpdateAccount = async (values: FieldType) => {
    const key = 'updateBskyAccount';

    if (!values.username || !values.appPassword) return;

    messageApi.open({
      content: 'Updating Bluesky profile...',
      key,
      type: 'loading',
      duration: 0,
    });
    setUpdating(true);

    const res = await updateBskyAccount(values.username, values.appPassword);
    if (res instanceof Error) {
      messageApi.open({
        key,
        content: `Error: ${res.message}`,
        type: 'error',
      });
    } else {
      messageApi.success({
        key,
        content: 'Updated Bluesky profile.',
        duration: 2,
      });
      form.resetFields();
    }

    setUpdating(false);
  };

  const panel = () => {
    return (
      <FavConfigProvider>
        {contextHolder}
        <div>
          <Form
            autoComplete="off"
            layout="vertical"
            onFinish={onUpdateAccount}
            form={form}
          >
            <Form.Item<FieldType>
              label="Username"
              name="username"
              initialValue={
                settings && settings.bskyUsername ? settings.bskyUsername : ''
              }
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
              initialValue={''}
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
                className="mx-auto bg-[#dc03dc] font-bold"
                loading={updating}
                disabled={updating}
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
          collapsible={disabled === false ? 'header' : 'disabled'}
        />
      </div>
    </FavConfigProvider>
  );
};

export default function BskySettings({ user, settings }: Props) {
  const [isEnabled, setIsEnabled] = useState(settings.bskyEnabled === true);
  const [postRecords, setPostRecords] = useState(
    settings.bskyPostRecords === true
  );
  const [postSummary, setPostSummary] = useState(
    settings.bskyPostSummary === true
  );

  useEffect(() => {
    updateGeneralSettings(user, {
      bskyEnabled: isEnabled,
      bskyPostRecords: postRecords,
      bskyPostSummary: postSummary,
    }).then((res) => {
      if (res instanceof Error) {
        console.error(res);
      }
    });
  }, [isEnabled, postRecords, postSummary, user]);

  return (
    <>
      <FavConfigProvider>
        <div className="mb-3 flex items-center">
          <h2 className="mb-1 mr-4 text-2xl font-bold">Bluesky Integration</h2>
          <Switch
            className="bg-slate-600"
            checked={isEnabled}
            onClick={() => setIsEnabled(!isEnabled)}
          />
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
            <Checkbox
              checked={postRecords}
              disabled={!isEnabled}
              onClick={() => setPostRecords(!postRecords)}
            >
              <p>Post when your record your favorites.</p>
            </Checkbox>
            <p className="ml-6 text-sm text-slate-500">
              Enabling this will post your record to Bluesky everytime your
              record your URL.
            </p>
          </div>
          <div className="mb-2">
            <Checkbox
              checked={postSummary}
              disabled={!isEnabled}
              onClick={() => setPostSummary(!postSummary)}
            >
              <p>Post weekly summary to Bluesky.</p>
            </Checkbox>
            <p className="ml-6 text-sm text-slate-500">
              Enabling this will post the weekly summary to Bluesky.
            </p>
          </div>

          <BskyAccountPanel
            user={user}
            settings={settings}
            disabled={!isEnabled}
          />
        </div>
      </FavConfigProvider>
    </>
  );
}
