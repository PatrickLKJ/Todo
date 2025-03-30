import React from 'react';
import { Select, Tag } from 'antd';
import { FlagFilled } from '@ant-design/icons';

const { Option } = Select;

export interface PrioritySelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const PrioritySelect: React.FC<PrioritySelectProps> = ({ value, onChange }) => {
  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Select value={value} onChange={handleChange} style={{ width: '100%' }}>
      <Option value="high">
        <Tag color="error">
          <FlagFilled /> 高
        </Tag>
      </Option>
      <Option value="medium">
        <Tag color="warning">
          <FlagFilled /> 中
        </Tag>
      </Option>
      <Option value="low">
        <Tag color="default">
          <FlagFilled /> 低
        </Tag>
      </Option>
    </Select>
  );
};
