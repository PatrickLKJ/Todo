package redlib.backend.service.impl;

import eu.bitwalker.useragentutils.Browser;
import eu.bitwalker.useragentutils.OperatingSystem;
import eu.bitwalker.useragentutils.UserAgent;
import eu.bitwalker.useragentutils.Version;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import redlib.backend.dao.AdminMapper;
import redlib.backend.dao.AdminPrivMapper;
import redlib.backend.dao.LoginLogMapper;
import redlib.backend.dao.UserMapper;
import redlib.backend.model.Admin;
import redlib.backend.model.AdminPriv;
import redlib.backend.model.LoginLog;
import redlib.backend.model.Token;
import redlib.backend.model.User;
import redlib.backend.service.TokenService;
import redlib.backend.service.utils.TokenUtils;
import redlib.backend.utils.FormatUtils;
import redlib.backend.vo.OnlineUserVO;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class TokenServiceImpl implements TokenService {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private LoginLogMapper loginLogMapper;

    @Autowired
    private AdminPrivMapper adminPrivMapper;

    private Map<String, Token> tokenMap = new ConcurrentHashMap<>(1 << 8);

    /**
     * 用户登录，返回令牌信息
     *
     * @param username  用户名
     * @param password  密码
     * @param ipAddress
     * @param userAgent
     * @return 令牌信息
     */
    @Override
    public Token login(String username, String password, String ipAddress, String userAgent) {
        // 直接用用户名密码查询
        User user = userMapper.login(username, password);
        Assert.notNull(user, "用户名或者密码错误");
        
        Token token = new Token();
        token.setAccessToken(makeToken());
        token.setUserId(user.getId());
        token.setUserName(user.getNickname());
        token.setUserCode(username);
        
        tokenMap.put(token.getAccessToken(), token);
        return token;
    }

    /**
     * 根据token获取令牌信息
     *
     * @param accessToken token
     * @return 令牌信息
     */
    @Override
    public Token getToken(String accessToken) {
        if (FormatUtils.isEmpty(accessToken)) {
            return null;
        }

        return tokenMap.get(accessToken);
    }

    /**
     * 登出系统
     *
     * @param accessToken 令牌token
     */
    @Override
    public void logout(String accessToken) {

    }

    /**
     * 获取在线用户列表
     *
     * @return
     */
    @Override
    public List<OnlineUserVO> list() {
        Collection<Token> tokens = tokenMap.values();
        return tokens.stream().map(item -> TokenUtils.convertToVO(item)).collect(Collectors.toList());
    }

    /**
     * 将在线用户踢出系统
     *
     * @param accessToken 用户的accessToken
     */
    @Override
    public void kick(String accessToken) {

    }

    private String makeToken() {
        return UUID.randomUUID().toString().replaceAll("-", "") + "";
    }
}
