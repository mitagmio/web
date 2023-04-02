/* eslint-disable @next/next/no-img-element */
import { useTranslation } from 'react-i18next';
import { Grid, Text, Row, Col, Collapse, Avatar, Spacer, Button } from '@nextui-org/react';
import { GEN16 } from 'assets/icons';

export const OurTeam = () => {
  const { t } = useTranslation();

  const columns = [
    { name: t('name'), uid: 'name' },
    { name: t('role'), uid: 'role' },
    { name: t('status'), uid: 'status' },
  ];

  const users = [
    {
      name: 'Beybut',
      role: `${t('CEO')} & ${t('developer')}`,
      color: 'primary',
      statusText: t('available'),
      avatar: '/img/beycoder.jpeg',
      // linkedin: 'https://www.linkedin.com/in/beycoder',
      telegram: 'https://beycoder.t.me',
      content: <Text>{t('beybutContent')}</Text>,
    },
    {
      name: 'Evgeniy',
      role: t('productManager'),
      color: 'secondary',
      statusText: t('available'),
      avatar: '/img/izosimov.jpeg',
      telegram: 'https://IzosimovEA.t.me',
      content: <Text>{t('evgeniyContent')}</Text>,
    },
    {
      name: 'Nick',
      role: t('seniorDeveloper'),
      color: 'gradient',
      statusText: t('available'),
      avatar: '/img/tatadev.jpeg',
      // linkedin: 'https://www.linkedin.com/in/nick-tataru',
      telegram: 'https://tatadev.t.me',
      content: <Text>{t('nickContent')}</Text>,
    },
  ];
  return (
    <Grid.Container alignItems="center" justify='center' css={{ minHeight: 'calc(100vh - 57px)' }}>
      <Grid>
        <Grid.Container id="team" gap={2} justify="center">
          <Grid>
            <Text size="$3xl">{t('ourTeam')}</Text>
          </Grid>
        </Grid.Container>
        <Grid.Container gap={2} justify="center" alignItems="center">
          <Grid xs={0} sm={true} css={{ position: 'absolute', left: '-100px', bottom: '-100px' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                width: 360,
                height: 360,
                margin: 64,
                pointerEvents: 'none',
              }}
            >
              <img
                src="/img/nft.png"
                alt="NFT"
                style={{ height: '100%', opacity: 0.25, filter: 'brightness(0.95)' }}
              />
            </div>
          </Grid>
          <Grid css={{ maxWidth: 400 }}>
            <Collapse.Group shadow css={{ zIndex: 1 }}>
              {users.map((user, i) => (
                <Collapse
                  key={i}
                  title={
                    <Row justify="space-between">
                      <Col>
                        <Text>{user.name}</Text>
                      </Col>
                      <Col css={{ w: 'auto', display: 'inline-flex', paddingRight: 16 }}>
                        {user.telegram && (
                          <Button
                            flat
                            size="xs"
                            icon={<GEN16 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />}
                            css={{ minWidth: 24 }}
                            onClick={() => window.open(user.telegram, '_blank')}
                          />
                        )}
                      </Col>
                    </Row>
                  }
                  subtitle={user.role}
                  contentLeft={
                    <Avatar
                      size="xl"
                      src={user.avatar}
                      color={user.color as any}
                      bordered
                      squared
                    />
                  }
                >
                  {user.content}
                </Collapse>
              ))}
            </Collapse.Group>
          </Grid>
          <Grid xs={0} sm={true} css={{ position: 'absolute', right: '-100px', top: '-100px' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignContent: 'center',
                width: 360,
                height: 360,
                margin: 64,
                pointerEvents: 'none',
              }}
            >
              <img
                src="/img/rocket.png"
                alt="Rocket"
                style={{ height: '100%', opacity: 0.25, filter: 'brightness(0.95)' }}
              />
            </div>
          </Grid>
        </Grid.Container>
      </Grid>
    </Grid.Container>
  );
};
