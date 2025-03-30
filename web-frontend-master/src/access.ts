import { useModel } from 'umi';

const TaskList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<API.Task | undefined>(undefined);
  
  // 获取当前用户ID
  const currentUserId = initialState?.currentToken?.userId;
  
  // ... 其他代码不变
}

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentToken?: API.Token } | undefined) {
  const { currentToken } = initialState || {};
  const { userCode } = currentToken || {};
  
  // 确保privSet始终是数组
  const privSet = Array.isArray(currentToken?.privSet) ? currentToken.privSet : [];

  return {
    hasPrivilege: (route: any) => {
      // 如果是root用户或者路由名称在权限集中，则允许访问
      return 'root' === userCode || privSet.includes(route.name + '.page');
    }
  };
}
