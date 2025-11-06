const router = require('express').Router();
const passport = require('passport');

// kick off OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile','email'] }));

// callbacks
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/failure' }),
  (req, res) => {
    // success – redirect back to frontend
    res.redirect(process.env.CLIENT_URL + '/auth/success');
  });

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/api/auth/failure' }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL + '/auth/success');
  });

// whoami
router.get('/me', (req, res) => {
  if (!req.user) return res.status(200).json(null);
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    avatar_url: req.user.avatar_url,
    is_admin: req.user.is_admin
  });
});

// logout
router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.status(204).end();
    });
  });
});

router.get('/failure', (_req, res) => res.status(401).json({ error: 'Auth failed' }));

module.exports = router;
