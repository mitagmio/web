/* eslint-disable @next/next/no-img-element */
import { useTranslation } from 'react-i18next'
import cn from 'classnames'
// import Time from 'react-countdown';
import { Card, Container, Grid, Text, Spacer, Progress, keyframes, Link, Button, Avatar } from '@nextui-org/react'
import { AnimatePresence } from 'framer-motion'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component'
import 'react-vertical-timeline-component/style.min.css'
import { ABS20, ABS22, ABS23, ABS24, ABS25, ABS26, ABS27, ABS28, ABS32, ABS46, GEN02, GRA01, GRA10 } from 'assets/icons'

import { ReactComponent as FCK } from 'assets/logo.svg'

const deadline = 1677420000000

const gradient = keyframes({
  '0%': { textGradient: '45deg, $blue600 0%, $green600 100%' },
  '10%': { textGradient: '45deg, $blue600 -5%, $green600 95%' },
  '20%': { textGradient: '45deg, $blue600 -10%, $green600 90%' },
  '30%': { textGradient: '45deg, $blue600 -15%, $green600 85%' },
  '40%': { textGradient: '45deg, $blue600 -20%, $green600 80%' },
  '50%': { textGradient: '45deg, $blue600 -15%, $green600 85%' },
  '60%': { textGradient: '45deg, $blue600 -10%, $green600 90%' },
  '70%': { textGradient: '45deg, $blue600 -5%, $green600 95%' },
  '80%': { textGradient: '45deg, $blue600 0%, $green600 100%' },
  '90%': { textGradient: '45deg, $blue600 5%, $green600 105%' },
  '100%': { textGradient: '45deg, $blue600 0%, $green600 100%' },
})

export const Countdown = () => {
  const { t } = useTranslation()

  const Completion = () => (
    <Link href="https://t.me/tokenFCK" target="_blank">
      <Button color="gradient" css={{ margin: 32 }}>
        {t('joinNow')}
      </Button>
    </Link>
  )

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <Completion />
    } else {
      // Render a countdown
      return (
        <>
          <AnimatePresence>
            <Grid.Container
              gap={2}
              alignItems="center"
              justify="center"
              css={{
                animation: `${gradient} 1s infinite`,
              }}
            >
              {days ? (
                <Grid>
                  <Text size="$4xl" weight="bold">
                    {days} {t('days')}
                  </Text>
                </Grid>
              ) : null}
              {hours ? (
                <Grid>
                  <Text size="$4xl" weight="bold">
                    {hours} {t('hours')}
                  </Text>
                </Grid>
              ) : null}
              {minutes ? (
                <Grid>
                  <Text size="$4xl" weight="bold">
                    {minutes} {t('minutes')}
                  </Text>
                </Grid>
              ) : null}

              <Grid>
                <Text size="$4xl" weight="bold">
                  {/* <motion.h1
                    key={seconds}
                    exit={{ y: 75, opacity: 0, position: 'absolute' }}
                    initial={{ y: -150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      ease: 'easeOut',
                      duration: 1,
                    }}
                  > */}
                  {seconds} {t('seconds')}
                  {/* </motion.h1> */}
                </Text>
              </Grid>
            </Grid.Container>
          </AnimatePresence>
        </>
      )
    }
  }

  const timeline = [
    {
      type: 'primary',
      date: `26 ${t('feb')} 2023`,
      icon: <ABS46 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: `${t('amaSession')} 1/4`,
      description: t('shareInfoAMA'),
    },
    {
      date: `23 ${t('feb')} 2023`,
      icon: <GEN02 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('platformUpdate'),
      description: t('platformUpdateDescription'),
    },
    {
      date: `21 ${t('feb')} 2023`,
      icon: <img src="/img/dedust.webp" width={24} height={24} alt="DeDust.io" />,
      title: t('deDustListing'),
      description: t('deDustListingDescription'),
    },
    {
      date: `14 ${t('feb')} 2023`,
      icon: <GRA10 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('addLiquidityStats'),
      description: t('addLiquidityStatsDescription'),
    },
    {
      date: `13 ${t('feb')} 2023`,
      icon: <ABS27 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('launchAnalyticsTools'),
      description: t('launchAnalyticsToolsDescription'),
    },
    {
      date: `5 ${t('feb')} 2023`,
      icon: <ABS25 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('publishPlatform'),
      description: t('publishPlatformDescription'),
    },
    {
      date: `1 ${t('feb')} 2023`,
      icon: <ABS28 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('featureAdvertiseNFT'),
      description: t('featureAdvertiseNFTDescription'),
    },
    {
      date: `31 ${t('jan')} 2023`,
      icon: <ABS22 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('newTeamMember'),
      description: t('newTeamMemberDescription'),
    },
    {
      date: `30 ${t('jan')} 2023`,
      icon: <ABS24 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('createPrivateChat'),
      description: t('createPrivateChatDescription'),
    },
    {
      date: `29 ${t('jan')} 2023`,
      icon: <ABS23 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('addTokenPriceInfo'),
      description: t('addTokenPriceInfoDescription'),
    },
    {
      date: `27 ${t('jan')} 2023`,
      icon: <ABS32 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('addPremiumSubscription'),
      description: t('addPremiumSubscriptionDescription'),
    },
    {
      date: `25 ${t('jan')} 2023`,
      icon: <ABS26 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('presentRoadMapTokenomics'),
      description: t('presentRoadMapTokenomicsDescription'),
    },
    {
      date: `24 ${t('jan')} 2023`,
      icon: <ABS20 style={{ fill: 'var(--nextui-colors-link)', fontSize: 32 }} />,
      title: t('releaseFragmentChecker'),
      description: t('releaseFragmentCheckerDescription'),
    },
    {
      date: `25 ${t('dec')} 2022`,
      icon: <FCK style={{ width: 24, height: 24, position: 'absolute' }} />,
      title: t('mintToken300k'),
      description: t('mintToken300kDescription'),
    },
  ]

  return (
    <>
      <Grid.Container
        id="ama"
        gap={2}
        justify="center"
        alignItems="center"
        css={{ minHeight: 'calc(100vh - 57px)', position: 'relative' }}
      >
        <Grid
          xs={0}
          sm={true}
          css={{
            position: 'absolute',
            left: '-150px',
            top: '-150px',
            animation: 'circleScale 5s infinite',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              width: 500,
              margin: 32,
              pointerEvents: 'none',
            }}
          >
            <img src="/img/ama.png" alt="AMA" style={{ height: '100%', filter: 'brightness(0.95)' }} />
          </div>
        </Grid>
        <Grid xs={12} sm={8}>
          <VerticalTimeline>
            {timeline.map((event, key) => (
              <VerticalTimelineElement
                key={key}
                className={cn('vertical-timeline-element--work', event.type)}
                contentStyle={
                  event.type === 'primary'
                    ? { background: '#064a24', color: '#1ac964' }
                    : { background: '#131d2a', color: '#1ac964' }
                }
                contentArrowStyle={{ borderRight: '7px solid  #064a24' }}
                date={event.date}
                iconStyle={{ background: '#064a24', color: '#1ac964' }}
                icon={event.icon}
              >
                <h3 className="vertical-timeline-element-title">{event.title}</h3>
                <p>{event.description}</p>
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        </Grid>
        {/* <Grid
          xs={12}
          sm={6}
          direction="column"
          alignItems="center"
          css={{ height: 'fit-content', zIndex: 2 }}
        >
          <Grid>
            <Text size="$3xl">{t('amaSession')}</Text>
          </Grid>
          <Grid.Container gap={0} justify="center">
            <Grid xs={12}>
              <Card variant="bordered">
                <Card.Body>
                  <Container gap={0} css={{ d: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>
                      {(
                        100 -
                        ((new Date(deadline).getDate() - new Date().getDate()) / 2) * 10
                      ).toFixed(0)}{' '}
                      %
                    </span>
                    <Spacer x={1} />
                    <Progress
                      value={parseFloat(
                        (
                          100 -
                          ((new Date(deadline).getDate() - new Date().getDate()) / 2) * 10
                        )?.toFixed(0)
                      )}
                      color="gradient"
                      shadow
                    />
                  </Container>
                </Card.Body>
              </Card>
            </Grid>
          </Grid.Container>
          <Time date={deadline} renderer={renderer} />
          <Card variant="bordered">
            <Card.Body css={{ display: 'block', textAlign: 'center' }}>
              {t('askAboutFuture')} <Link href="https://fragmentstatsru.t.me/">$FCK</Link>,{` `}
              {t('developmentMintCollaborations')}
              <br />
              {t('readyToAnswerQuestions')}
              <br />
              <br />
              {t('GoToAMASession')}
              <Text color="success">
                26.02.2023 16:00 {t('Kiev')} / 17:00 {t('MSK')}
              </Text>
            </Card.Body>
          </Card>
        </Grid> */}
        <Grid
          xs={0}
          sm={true}
          css={{
            position: 'absolute',
            right: '-150px',
            bottom: '-150px',
            animation: 'circleScale 5s infinite',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              width: 500,
              margin: 32,
              pointerEvents: 'none',
              zIndex: -1,
            }}
          >
            <img src="/img/ama2.png" alt="AMA" style={{ height: '100%', filter: 'brightness(0.95)' }} />
          </div>
        </Grid>
      </Grid.Container>
    </>
  )
}
